export function normalizeEmbedding(embedding) {
    const norm = Math.sqrt(embedding.reduce((acc, val) => acc + val * val, 0));
    return embedding.map((val) => val / norm);
  }