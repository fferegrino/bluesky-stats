import { AtpAgent } from '@atproto/api'
import fs from 'fs'
const agent = new AtpAgent({
  service: 'https://bsky.social'
})

const now = new Date()
const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() + 24 * 60 * 60 * 1000
const oneYearAgo = new Date(tomorrow - 365 * 24 * 60 * 60 * 1000)

await agent.login({
  identifier: process.env.IDENTIFIER,
  password: process.env.PASSWORD
})

const posts = []

const actor = 'feregri.no'

let {data, headers} = await agent.app.bsky.feed.getAuthorFeed({
    actor
})

posts.push(...data.feed.map(post => post.post.record.createdAt))

let cursor = data.cursor

while (cursor !== undefined) {
    const {data: feedData, headers: feedHeaders} = await agent.app.bsky.feed.getAuthorFeed({
        actor,
        cursor
    })

    posts.push(...feedData.feed.map(post => post.post.record.createdAt))
    cursor = feedData.cursor
    
    if (cursor === undefined) {
        break
    }

    const lastDate = new Date(cursor)
    if (lastDate < oneYearAgo) {
        break
    }
}

const saved = JSON.stringify(posts, null, 2)

fs.writeFileSync('posts.json', saved)
