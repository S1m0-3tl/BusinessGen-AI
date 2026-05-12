from pathlib import Path

from django.conf import settings


class RagUnavailableError(Exception):
    pass


def _import_chromadb():
    try:
        import chromadb
    except ImportError as exc:
        raise RagUnavailableError("ChromaDB is not installed. Run: pip install chromadb pypdf") from exc
    return chromadb


def _extract_pdf_text(path):
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise RagUnavailableError("PDF support is not installed. Run: pip install pypdf") from exc

    reader = PdfReader(str(path))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def extract_report_text(file_path):
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Report file not found: {path}")

    if path.suffix.lower() == ".pdf":
        return _extract_pdf_text(path)

    if path.suffix.lower() in {".txt", ".md", ".csv"}:
        return path.read_text(encoding="utf-8", errors="ignore")

    raise ValueError("Only PDF, TXT, MD, and CSV market reports are supported.")


def chunk_text(text, chunk_size=1200, overlap=200):
    clean = " ".join(text.split())
    chunks = []
    start = 0

    while start < len(clean):
        end = start + chunk_size
        chunk = clean[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = max(end - overlap, end)

    return chunks


def get_market_collection():
    chromadb = _import_chromadb()
    client = chromadb.PersistentClient(path=settings.RAG_CHROMA_DIR)
    return client.get_or_create_collection(name="market_reports_2026")


def ingest_market_report(file_path, source_name=None):
    path = Path(file_path)
    text = extract_report_text(path)
    chunks = chunk_text(text)
    collection = get_market_collection()
    source = source_name or path.name

    if not chunks:
        return {"source": source, "chunks_indexed": 0}

    ids = [f"{source}:{index}" for index in range(len(chunks))]
    metadatas = [{"source": source, "chunk": index} for index in range(len(chunks))]
    collection.upsert(ids=ids, documents=chunks, metadatas=metadatas)
    return {"source": source, "chunks_indexed": len(chunks)}


def query_market_context(query, limit=5):
    try:
        collection = get_market_collection()
        result = collection.query(query_texts=[query], n_results=limit)
    except RagUnavailableError:
        return []

    documents = result.get("documents", [[]])[0]
    metadatas = result.get("metadatas", [[]])[0]
    distances = result.get("distances", [[]])[0] if result.get("distances") else []

    contexts = []
    for index, document in enumerate(documents):
        metadata = metadatas[index] if index < len(metadatas) else {}
        distance = distances[index] if index < len(distances) else None
        contexts.append({
            "text": document,
            "source": metadata.get("source", "market-report"),
            "distance": distance,
        })
    return contexts
