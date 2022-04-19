const { spawn, exec } = require('child_process');
const db = require('simple-json-db');
const version = new db('./version.json');
const moment = require('moment');

// INCREASE BUILD
const mayor = version.get('mayor');
const minor = version.get('minor');
const current = version.get('build');
const beta = version.get('beta');
const currentDate = version.get('date');
const currentIndex = version.get('index');

// exec(`cordova-set-version -v ${mayor}.${minor}.${newVersion}`, (error, stdout, stderr) => {});

const theVersion = `${mayor}.${minor}.${current}`;
const pkgSet = `Beta-${beta} Build ${currentDate}-${currentIndex}`;
const pkgGit = pkgSet.replace(/\s/g, '_');

// git add -A && git commit -m "Build v${theVersion}_${pkgGit}" && git flow release finish "${theVersion}_${pkgGit}" -m "Finish v${theVersion}_${pkgGit}" && git push origin master && git push origin develop
exec(`git add -A && git commit -m "Build v${theVersion}_${pkgGit}"`, (error, stdout, stderr) => {
    if(stdout){
        console.log(stdout);
    }
    if(error){
        console.log(error);
    }
    if(stderr){
        console.log(stderr);
    }
});