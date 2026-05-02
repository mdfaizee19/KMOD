const fs = require("fs");
const path = require("path");

const BACKUP_DIR = ".kmod-backups";

/**
 * Creates a checkpoint of the files that are about to be modified.
 * @param {string[]} files List of file paths to backup
 * @param {string} targetPath Root path of the project
 * @param {string} name Optional name for the checkpoint
 * @returns {string} The name/timestamp of the created checkpoint
 */
function createCheckpoint(files, targetPath, name = null) {
  if (files.length === 0) return null;

  const baseDir = fs.statSync(targetPath).isFile() ? path.dirname(targetPath) : targetPath;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const checkpointName = name || timestamp;
  const checkpointDir = path.join(baseDir, BACKUP_DIR, checkpointName);

  if (fs.existsSync(checkpointDir)) {
    throw new Error(`Checkpoint '${checkpointName}' already exists.`);
  }

  fs.mkdirSync(checkpointDir, { recursive: true });

  const meta = {
    timestamp: new Date().toISOString(),
    files: []
  };

  files.forEach(file => {
    const relativePath = path.relative(baseDir, file);
    const destPath = path.join(checkpointDir, relativePath || path.basename(file));
    const destDir = path.dirname(destPath);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(file, destPath);
    meta.files.push(relativePath);
  });

  fs.writeFileSync(path.join(checkpointDir, "meta.json"), JSON.stringify(meta, null, 2));

  return checkpointName;
}

/**
 * Rolls back the project to a specific or latest checkpoint.
 * @param {string} targetPath Root path of the project
 * @param {string} name Optional name of the checkpoint to rollback to
 * @returns {string[]} List of restored files
 */
function rollback(targetPath, name = null) {
  const backupsBase = path.join(targetPath, BACKUP_DIR);
  if (!fs.existsSync(backupsBase)) {
    throw new Error("No backups found.");
  }

  let checkpointName = name;
  if (!checkpointName) {
    const checkpoints = fs.readdirSync(backupsBase).filter(d => 
      fs.statSync(path.join(backupsBase, d)).isDirectory()
    );
    if (checkpoints.length === 0) {
      throw new Error("No checkpoints found.");
    }
    // Sort by name (which is timestamp if unnamed) to get the latest
    checkpoints.sort();
    checkpointName = checkpoints[checkpoints.length - 1];
  }

  const checkpointDir = path.join(backupsBase, checkpointName);
  if (!fs.existsSync(checkpointDir)) {
    throw new Error(`Checkpoint '${checkpointName}' not found.`);
  }

  const metaPath = path.join(checkpointDir, "meta.json");
  if (!fs.existsSync(metaPath)) {
    throw new Error(`Metadata not found for checkpoint '${checkpointName}'.`);
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
  
  meta.files.forEach(file => {
    const srcPath = path.join(checkpointDir, file);
    const destPath = path.join(targetPath, file);
    fs.copyFileSync(srcPath, destPath);
  });

  return meta.files;
}

module.exports = {
  createCheckpoint,
  rollback
};
