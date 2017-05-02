Build on Windows:

    npm install -g node-gyp
    npm install -g node-pre-gyp
    npm install --global windows-build-tools
    add %USERPROFILE%\.windows-build-tools\python27 to PATH
    npm install
    npm run rebuildWin
    npm run packWin


Build on Mac:

    npm install
    npm run rebuildMac
    npm run packMac
