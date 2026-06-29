#!/usr/bin/env node

import { runCli } from '../dist/cli.js';

const exitCode = await runCli(process.argv);
process.exit(exitCode);
