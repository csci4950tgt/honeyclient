import memfs from 'memfs';
import path from 'path';

// set up virtual filesystem:
const volume = new memfs.Volume();
const mappedFs = memfs.createFsFromVolume(volume);

// configure absolute directories:
volume.mkdirpSync(process.cwd());

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
    return Object.keys(volume.toJSON(`/artifacts/${ticketId}`));
  },
  getFileSystem() {
    return mappedFs;
  },
};
