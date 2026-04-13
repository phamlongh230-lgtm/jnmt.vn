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
pnpm --filter @workspace/db run push
npm install -g pnpm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs
npm install -g pnpm
sudo npm install -g pnpm
cd ~/project
ls ~
pnpm --filter @workspace/db run push
pnpm install
pnpm --filter @workspace/db run push
echo 'DATABASE_URL=postgresql://jnmt_db_user:HfR7ocs2DpNq3RJOPxY5gfuo8K6e909a@dpg-d77iijchg0os73cbj8p0-a/jnmt_db' > lib/db/.env
pnpm --filter @workspace/db run push
echo 'DATABASE_URL=postgresql://jnmt_db_user:HfR7ocs2DpNq3RJOPxY5gfuo8K6e909a@dpg-d77iijchg0os73cbj8p0-a.singapore-postgres.render.com/jnmt_db' > lib/db/.env
pnpm --filter @workspace/db run push
echo 'DATABASE_URL=postgresql://jnmt_db_user:HfR7ocs2DpNq3RJOPxY5gfuo8K6e909a@dpg-d77iijchg0os73cbj8p0-a.singapore-postgres.render.com/jnmt_db?sslmode=require' > lib/db/.env
pnpm --filter @workspace/db run push
curl -X POST https://jnmt.kr/api/schools/seed
git add -A
git commit -m "feat: add school search"
git push
ls ~/artifacts/jnmt-hub/src/components/
cp ~/Downloads/Navbar.tsx ~/artifacts/jnmt-hub/src/components/
cp ~/Downloads/LoginModal.tsx ~/artifacts/jnmt-hub/src/components/
cp ~/Downloads/RegisterModal.tsx ~/artifacts/jnmt-hub/src/components/
cp ~/Downloads/Navbar.tsx ~/artifacts/jnmt-hub/src/components/
cp ~/Downloads/LoginModal.tsx ~/artifacts/jnmt-hub/src/components/
cp ~/Downloads/RegisterModal.tsx ~/artifacts/jnmt-hub/src/components/
cp ~/Downloads/Navbar.tsx ~/artifacts/jnmt-hub/src/components/
cp ~/Downloads/LoginModal.tsx ~/artifacts/jnmt-hub/src/components/
cp ~/Downloads/RegisterModal.tsx ~/artifacts/jnmt-hub/src/components/
find ~ -name "Navbar.tsx" 2>/dev/null
find ~ -name "LoginModal.tsx" 2>/dev/null
find ~ -name "RegisterModal.tsx" 2>/dev/null
git add -A
git commit -m "fix: restore missing components"
git push
curl -X POST https://jnmt-kr.onrender.com/api/schools/seed
ls ~/artifacts/jnmt-hub/src/pages/
cp ~/Downloads/ChatPage.tsx ~/artifacts/jnmt-hub/src/pages/
cp ~/Downloads/DictionaryPage.tsx ~/artifacts/jnmt-hub/src/pages/
cp ~/Downloads/MapPage.tsx ~/artifacts/jnmt-hub/src/pages/
cp ~/Downloads/SchedulePage.tsx ~/artifacts/jnmt-hub/src/pages/
cp ~/Downloads/not-found.tsx ~/artifacts/jnmt-hub/src/pages/
find ~ -name "ChatPage.tsx" 2>/dev/null
git add -A
git commit -m "fix: restore all missing pages"
git push
ls ~/artifacts/jnmt-hub/src/pages/
ls ~/artifacts/jnmt-hub/src/components/
ls ~/artifacts/jnmt-hub/src/
cat ~/render-build.sh
ls ~/artifacts/api-server/src/routes/
git add -A
git commit -m "fix: restore missing api routes"
git push
cat ~/lib/db/src/schema/index.ts
echo 'export * from "./schools";' >> ~/lib/db/src/schema/index.ts
cat ~/lib/db/src/schema/index.ts
git add -A
git commit -m "fix: export schools schema"
git push
ls ~/lib/db/src/schema/
git add -A
git commit -m "fix: add schools schema file"
git push
git add -A
git commit -m "fix: add schools schema file"
git push
curl -X POST https://jnmt-kr.onrender.com/api/schools/seed
rm -rf ~/node_modules
npm install -g @anthropic-ai/claude-code
# 1. Clone dự án về
git clone https://github.com/phamlongh230-lgtm/jnmt.kr.git
git clone https://github.com/phamlongh230-lgtm/Claude-code.git
cd Claude-code
claude
npm install -g @anthropic-ai/claude-code
sudo npm install -g @anthropic-ai/claude-code
claude
sudo apt update && sudo apt install jq -y
cd ~/artifacts/jnmt-hub && claude
cd ~/jnmt.kr
claude
