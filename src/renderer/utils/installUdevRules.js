// -*- mode: js-jsx -*-
/* Chrysalis -- Kaleidoscope Command Center
 * Copyright (C) 2020  Keyboardio, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import sudo from "sudo-prompt";
import path from "path";
import tmp from "tmp";
import { spawn } from "child_process";
import { getStaticPath } from "../config";

import Log from "../../api/log";

const installUdevRules = async devicePath => {
  const rules = path.join(getStaticPath(), "udev", "60-kaleidoscope.rules");
  const tmpRules = tmp.fileSync();
  const logger = new Log();

  logger.debug("Running: ", "cp " + rules + " " + tmpRules.name);
  await spawn("cp", [rules, tmpRules.name]);

  const cmd =
    "(mv /etc/udev/rules.d/60-kaleidoscope.rules " +
    "/etc/udev/rules.d/60-kaleidoscope.rules.orig || true) && " +
    "install -o root -g root " +
    tmpRules.name +
    " /etc/udev/rules.d/60-kaleidoscope.rules && " +
    "rm " +
    tmpRules.name +
    " && " +
    "udevadm control --reload-rules && " +
    "udevadm trigger " +
    devicePath;
  return new Promise(async (resolve, reject) => {
    logger.debug("Running:", cmd);
    sudo.exec(cmd, { name: "Chrysalis" }, error => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
};

export { installUdevRules };
