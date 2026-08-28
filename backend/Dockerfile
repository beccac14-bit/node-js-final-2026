# 地基：裝好 Node 20 的環境
FROM node:20-alpine        
# 之後的指令都在容器的 /app 裡執行
WORKDIR /app             
# 先只複製 package.json 和 package-lock.json  
COPY package*.json ./  
# --omit=dev，代表只安裝 dependencies，不裝 devDependencies
RUN npm ci --omit=dev         
 # 再複製其餘程式碼（目的地一樣是 /app，. 和 ./ 效果相同） 
COPY . .      
# 容器啟動時執行的指令
CMD ["npm", "start"]       
