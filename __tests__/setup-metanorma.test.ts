import * as io from '@actions/io';
import * as exec from '@actions/exec';
import * as path from 'path';

jest.mock('@actions/exec');

const toolDir = path.join(__dirname, 'runner', 'tools');
const tempDir = path.join(__dirname, 'runner', 'temp');

process.env['AGENT_TOOLSDIRECTORY'] = toolDir;
process.env['RUNNER_TOOL_CACHE'] = toolDir;
process.env['RUNNER_TEMP'] = tempDir;

import {installMetanormaVersion} from '../src/installer';

const IS_WINDOWS = process.platform === 'win32';
const IS_MACOSX = process.platform === 'darwin';
const IS_LINUX = process.platform === 'linux';

describe('find-ruby', () => {
  beforeAll(async () => {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
  });

  afterAll(async () => {
    try {
      await io.rmRF(toolDir);
      await io.rmRF(tempDir);
    } catch {
      console.log('Failed to remove test directories');
    }
  }, 100000);

  it('install metanorma with no version', async () => {
    await installMetanormaVersion(null);

    let cmd: string | null = null;
    if (IS_MACOSX) {
      cmd =
        'brew install --HEAD https://raw.githubusercontent.com/metanorma/homebrew-metanorma/master/Formula/metanorma.rb';
    } else if (IS_LINUX) {
      cmd = 'sudo gem install metanorma-cli';
    } else if (IS_WINDOWS) {
      cmd = 'choco install metanorma --yes';
    }
    expect(exec.exec).toHaveBeenCalledWith(cmd);
  });

  it('install metanorma with version 1.2.3', async () => {
    await installMetanormaVersion('1.2.3');

    let cmd: string | null = null;
    if (IS_MACOSX) {
      cmd =
        'brew install --HEAD https://raw.githubusercontent.com/metanorma/homebrew-metanorma/v1.2.3/Formula/metanorma.rb';
    } else if (IS_LINUX) {
      cmd = 'sudo gem install metanorma-cli -v 1.2.3';
    } else if (IS_WINDOWS) {
      cmd = 'choco install metanorma --yes --version 1.2.3';
    }
    expect(exec.exec).toHaveBeenCalledWith(cmd);
  });

  // TODO add more tests
});