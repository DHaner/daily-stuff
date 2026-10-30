import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * The image picker hands back a URI inside the cache directory, which the OS may purge.
 * Entries therefore keep their own copy under the app's document directory.
 */
function getPhotosDirectory() {
  return new Directory(Paths.document, 'journal');
}

/** Copies a freshly picked photo into permanent storage; photos already stored are returned as-is. */
export async function persistJournalPhoto(uri: string): Promise<string> {
  // Web has no document directory; the picked blob/data URI is all there is.
  if (Platform.OS === 'web') {
    return uri;
  }

  const directory = getPhotosDirectory();

  if (uri.startsWith(directory.uri)) {
    return uri;
  }

  directory.create({ idempotent: true, intermediates: true });

  const extension = uri.split('?')[0].split('.').pop()?.toLowerCase();
  const safeExtension = extension && /^[a-z0-9]{2,5}$/.test(extension) ? extension : 'jpg';
  const destination = new File(directory, `${Date.now().toString(36)}.${safeExtension}`);

  new File(uri).copy(destination);

  return destination.uri;
}

/** Best-effort removal of a stored photo; a missing file is not an error. */
export function deleteJournalPhoto(uri: string | null) {
  if (!uri || Platform.OS === 'web') {
    return;
  }

  try {
    const file = new File(uri);

    if (file.exists) {
      file.delete();
    }
  } catch {
    // The photo is already gone or unreachable; there is nothing left to clean up.
  }
}
