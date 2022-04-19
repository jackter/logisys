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

// const newVersion = current + 1;
const newBeta = beta + 1;
const newDate = moment(new Date()).format('YYMMDD').toString();
let newIndex = 1;
if(currentDate === newDate){
    newIndex = currentIndex + 1;
}

version.set('beta', newBeta);
version.set('date', newDate);
version.set('index', newIndex);

// exec(`cordova-set-version -v ${mayor}.${minor}.${newVersion}`, (error, stdout, stderr) => {});

const theVersion = `${mayor}.${minor}.${current}`;
const pkgSet = `Beta-${newBeta} Build ${newDate}-${newIndex}`;
const pkgGit = pkgSet.replace(/\s/g, '_');

exec(`git checkout -b release/${theVersion}_${pkgGit}`, (error, stdout, stderr) => {});
// exec(`git flow release start "${theVersion}_${pkgGit}"`, (error, stdout, stderr) => {});

exec(`npm version ${theVersion}`, (error, stdout, stderr) => {});

exec(`npm pkg set versionDate="${pkgSet}"`, (error, stdout, stderr) => {});