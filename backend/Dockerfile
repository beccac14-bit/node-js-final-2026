FROM node:20-alpine        # 地基：裝好 Node 20 的環境
WORKDIR /app               # 之後的指令都在容器的 /app 裡執行
COPY package*.json ./      # 先只複製 package.json 和 package-lock.json
RUN npm install            # 在 image 裡裝套件（不是用你電腦的 node_modules）
COPY . .                   # 再複製其餘程式碼（目的地一樣是 /app，. 和 ./ 效果相同）
CMD ["npm", "start"]       # 容器啟動時執行的指令
