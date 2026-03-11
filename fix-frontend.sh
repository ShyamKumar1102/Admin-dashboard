#!/bin/bash
cd /home/ubuntu/seniot/frontend/src/pages
sed -i "s|fetch('http://localhost:5000/api|const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; fetch(\`\${API_URL}|g" Banners.jsx
cd /home/ubuntu/seniot/frontend
npm run build
