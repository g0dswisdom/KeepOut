import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from 'express';
import { ulid } from "ulid";
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { dmUser } from "..";
import { EmbedBuilder } from "discord.js";

export type webhookT = {
    hash: string,
    url: string,
    config: {
        logRestrictedActions: boolean,
        blockMentions: boolean,
        blockInvites: boolean,
        blacklistedWords: string[],
    },
    owner: string
}

let webhookList = path.join(__dirname, '../proxy/webhooks.json');
let webhooks: webhookT[] = [];

export function init() {
    if (fs.existsSync(webhookList)) {
        const data = fs.readFileSync(webhookList, 'utf8');
        webhooks = JSON.parse(data);
    } else {
        console.log('No webhooks.json file found! Please create one in the proxy directory.')
    }
}

init();

export const post_create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let url = req.body.url;
    let config = req.body.config;
    let owner = req.body.owner;

    if (!url || !config) {
        res.status(404).send('config or url where?');
        return;
    }

    await axios({
        method: 'GET',
        url: url
    }).then((resp) => {
        if (resp.data.code && resp.data.code === 50027) {
            res.status(404).send('invalid webhook');
            return;
        }
    })

    let ulidStr = ulid();
    while (webhooks.some(item => item.hash === ulidStr)) {
        ulidStr = ulid();
    }

    if (webhooks.some(item => item.url === url)) {
        res.status(400).send('this webhook already exists');
        return;
    }

    bcrypt.hash(ulidStr, 10, function(err, hash) {
        if (err) {
            console.log(err);
            return res.status(500).send('An error occured when trying to hash the webhook');
        }

        let payload: webhookT = {
            hash: hash,
            url: url,
            config: config,
            owner: owner,
        }

        webhooks.push(payload);
        fs.writeFileSync(webhookList, JSON.stringify(webhooks, null, 2));
        res.json(payload); // this shouldn't be bad.. i hope
    })
})

function updatefile() { // used only once, i thought this would fix something lol
    fs.writeFileSync(webhookList, JSON.stringify(webhooks, null, 2));
}

export async function deleteWebhook(hash: string, ownerId: string) {
    const index = webhooks.findIndex(item => item.hash === hash && item.owner === ownerId);
    if (index !== -1) {
        const webhookToDelete = webhooks[index];
        await axios({
            method: 'DELETE',
            url: webhookToDelete.url,
        }).then((resp) => {
            webhooks.splice(index, 1);
            fs.writeFileSync(webhookList, JSON.stringify(webhooks, null, 2));
            return true;
        }).catch((err) => {
            console.log(err);
            return false;
        });
    }
}

export function blacklist(hash: string, word: string) {
    let webhook = webhooks.find(item => item.hash === hash);
    if (webhook) {
        if (!webhook.config.blacklistedWords) {
            webhook.config.blacklistedWords = [];
        }

        if (!webhook.config.blacklistedWords.includes(word)) {
            webhook.config.blacklistedWords.push(word);
            updatefile();
            return true;
        }
    }
    return false;
}

function embed(ip: string) {
    let logEmbed = new EmbedBuilder()
    .setColor('#bf0f0f')
    .setTitle('Webhook Security')
    .setDescription('Someone tried performing a restricted action on your secured webhook! Luckily, we mitigated it.')
    .addFields(
        {
            name: 'User', value: `User IP: ${ip}`
        }
    );
    return logEmbed;
}
// TODO: whenever I host this, and if I do, ratelimit the blacklisted persons ip (so they cant spam dms)
// or just do it yourself :shrug: its ez

export const post_message = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let webhookHash = req.query.hash;
    let content = req.body.content;
    let webhook = webhooks.find(item => item.hash === webhookHash);
    let url = webhook?.url;
    let config = webhook?.config

    let ip: string = req.headers['X-Forwarded-For'] ? req.headers['X-Forwarded-For'] as string : 'none'; // this can be spoofed afaik, better use cloudflare

    if (webhook) {
        if (config?.blockMentions == true) {
            if (content.includes('@')) {
                if (config.logRestrictedActions == true) {
                    let logEmbed = embed(ip);
                    dmUser(webhook.owner, {embeds: [logEmbed]})
                    //dmUser(webhook.owner, `Someone tried pinging someone using your secured webhook! IP: ${ip}`);
                }
                res.status(400).send("You're not allowed to do that!");
                return;
            }
            if (content.includes('discord.gg') || content.includes('discordapp.com/invite') || content.includes('dsc.gg')) {
                if (config.logRestrictedActions == true) {
                    let logEmbed = embed(ip);
                    dmUser(webhook.owner, {embeds: [logEmbed]})
                }
                res.status(400).send("You're not allowed to do that!");
                return;
            }
        }
        await axios({
            method: 'POST',
            url: url,
            data: {
                'content': content
            }
        }).then((resp) => {
            res.status(200).send('Done');
        }).catch((err) => console.log(err));
    }
})