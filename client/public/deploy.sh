echo "Switching to branch master"
git checkout master

echo "Building app....."
npm run build

echo "Deploying files to server..."
scp -r build/* richard@netsend.pw:/var/www/netsend.pw/

echo "Done!"