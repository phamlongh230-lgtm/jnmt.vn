unzip -l Code-Runner-Render.zip | sort -n -k1
git status
git init
git remote add origin https://github.com/phamlongh230-lgtm/jnmt.kr.git
git add .
git commit -m "Backup code sach truoc khi tra may"
git branch -M main
git push -u origin main
git config --global user.email "phamlongh230@gmail.com"
git config --global user.name "phamlongh230-lgtm"
git add .
git commit -m "Backup code sach truoc khi tra may"
git branch -M main
git push -u origin main
grep -rnw . -e "app.listen" --exclude-dir={node_modules,artifacts,dist}
# Lệnh này thay thế cổng cứng (ví dụ 3000) bằng process.env.PORT
sed -i 's/listen(3000/listen(process.env.PORT || 10000/g' src/server.ts
find . -name "*.ts" -o -name "*.js" | xargs grep -l "listen"
find . -name "index.ts" | grep api-server
nano ./artifacts/api-server/src/index.ts
vi ./artifacts/api-server/src/index.ts
