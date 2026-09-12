# Crove NodeJS SDK

This is the NodeJS SDK for [Crove](https://crove.com).

You can start by installing the package:

```bash
npm install @crove/node
```

## Usage
```typescript
import Crove from '@crove/node';
const crove = new Crove('your api key', 'your self-hosted instance (optional)');
```

The second argument defaults to `https://post.crove.com/api`. Pass your own
base URL if you run a self-hosted instance.

The available methods are:
- `post(posts: CreatePostDto)` - Schedule a post to Crove
- `postList(filters: GetPostsDto)` - Get a list of posts
- `upload(file: Buffer, extension: string)` - Upload a file to Crove
- `integrations()` - Get a list of connected channels
- `deletePost(id: string)` - Delete a post by ID

Your API key is available in the application under **Settings → Developer**.
Alternatively you can use the SDK with curl against the same
`/public/v1/*` routes.
