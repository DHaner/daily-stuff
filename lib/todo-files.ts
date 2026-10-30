import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

/** The document picker copies into the cache, which the OS may purge, so tasks keep their own copy. */
function getFilesDirectory() {
  return new Directory(Paths.document, 'tasks');
}

/** Copies a freshly picked file into permanent storage; files already stored are returned as-is. */
export function persistTaskFile(uri: string, name: string): string {
  // Web has no document directory; the picked blob URI is all there is.
  if (Platform.OS === 'web') {
    return uri;
  }

  const directory = getFilesDirectory();

  if (uri.startsWith(directory.uri)) {
    return uri;
  }

  directory.create({ idempotent: true, intermediates: true });

  const safeName = name.replace(/[^\w.-]+/g, '_');
  const destination = new File(directory, `${Date.now().toString(36)}-${safeName}`);

  new File(uri).copy(destination);

  return destination.uri;
}

/** Best-effort removal of a stored file; a missing file is not an error. */
export function deleteTaskFile(uri: string | null) {
  if (!uri || Platform.OS === 'web') {
    return;
  }

  try {
    const file = new File(uri);

    if (file.exists) {
      file.delete();
    }
  } catch {
    // The file is already gone or unreachable; there is nothing left to clean up.
  }
}
