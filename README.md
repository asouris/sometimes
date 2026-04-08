# timestruck
Web app to measure time :)

## How run
First clone this repo.
A script will install the python requirements and the packages needed to run this. You will need python ofc, `npm` and `npx`.
Then make the script executable
```
chmod +x localSetup.sh
```
And run it
```
./localSetup.ch
```

## How to build
First clone this repo.
Then install some libraries
```
npm install
```
Then build the app with tauri, this takes a lot of time...
```
npm run tauri build
```
The app will be in `src-tauri/target/release/app`
```
You can run it with 
```
./src-tauri/target/release/app
```