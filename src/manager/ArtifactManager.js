import memfs from 'memfs';
import path from 'path';

// set up virtual filesystem:
const volume = new memfs.Volume();
const mappedFs = memfs.createFsFromVolume(volume);

// configure absolute directories:
volume.mkdirpSync(process.cwd());

// recursively finds and deletes old artifacts:
async function walkAndDelete(dir) {
  const allDirEnts = await mappedFs.promises.readdir(dir, {
    withFileTypes: true,
  });

  await Promise.all(
    allDirEnts.map(async dirEnt => {
      const res = path.resolve(dir, dirEnt.name);

      if (dirEnt.isDirectory()) {
        return walkAndDelete(res);
      }

      const stats = await mappedFs.promises.stat(res);

      // if a file is older than 15 minutes, delete it:
      if (Date.now() - stats.ctimeMs > 1000 * 60 * 15) {
        console.log(`${res} is more than fifteen minutes old, deleting it...`);

        await mappedFs.promises.unlink(res);
      }
    })
  );
}

// cleanup routine:
setInterval(() => walkAndDelete(`/`), 60 * 5 * 1000); // every 5 minutes

export default {
  artifactToPath(artifact) {
    return `/artifacts/${artifact.ticketId}/${artifact.filename}`;
  },
  storeArtifactsForTicket(artifacts) {
    for (const artifact of artifacts) {
      const targetPath = this.artifactToPath(artifact);

      // make directory if we need to:
      mappedFs.mkdirSync(path.dirname(targetPath), { recursive: true });

      // save:
      volume.writeFileSync(targetPath, artifact.data);
    }
  },
  listArtifactsByTicketId(ticketId) {
    const data = volume.toJSON(`/artifacts/${ticketId}`);

    // filter out empty directories:
    return Object.keys(data).filter(el => data[el] != null);
  },
  getFileSystem() {
    return mappedFs;
  },
};
