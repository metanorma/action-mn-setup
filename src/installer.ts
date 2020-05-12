import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';
import * as fs from 'fs';
import fetch from 'node-fetch';

const IS_WINDOWS = process.platform === 'win32';
const IS_MACOSX = process.platform === 'darwin';
const IS_LINUX = process.platform === 'linux';

async function download(url: string, path: string) {
  console.log(`url: ${url}`);
  const res = await fetch(url);
  await new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(path);
    res.body.pipe(fileStream);
    res.body.on('error', err => {
      reject(err);
    });
    fileStream.on('finish', function() {
      resolve();
    });
  });
}

export async function installMetanormaVersion(version: string | null) {
  let toolPath: string | null = null;

  let revision: string = 'master';
  if (version != null) {
    revision = `v${version}`;
  }

  let cmd: string | null = null;
  if (IS_MACOSX) {
    let formulaUrl: string = `https://raw.githubusercontent.com/metanorma/homebrew-metanorma/${revision}/Formula/metanorma.rb`;
    cmd = `brew install --HEAD ${formulaUrl}`;
  } else if (IS_LINUX) {
    let scriptFile: string = './ubuntu.sh';
    let scriptUrl: string = `https://raw.githubusercontent.com/metanorma/metanorma-linux-setup/master/ubuntu.sh`;
    await download(scriptUrl, scriptFile);
    await exec.exec('sudo apt-get update -y');
    await exec.exec(`sudo bash ${scriptFile}`);
    if (version) {
      cmd = `sudo gem install metanorma-cli -v ${version}`;
    } else {
      cmd = 'sudo gem install metanorma-cli';
    }
  } else if (IS_WINDOWS) {
    if (version) {
      cmd = `choco install metanorma --yes --version ${version}`;
    } else {
      cmd = 'choco install metanorma --yes';
    }
    toolPath = `${process.env.ChocolateyPackageFolder}\\metanorma`;
  }

  if (cmd) {
    await exec.exec(cmd);
  } else {
    throw new Error(`Unsupported platform ${process.platform}`);
  }

  if (toolPath != null) {
    core.addPath(toolPath);
  }
}