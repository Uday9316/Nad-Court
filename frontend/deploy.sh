#!/bin/bash
npm run build
echo "{"framework":"vite","rewrites":[{"source":"/(.*)","destination":"/index.html"}]}" > dist/vercel.json
cd dist
vercel --prod --yes
