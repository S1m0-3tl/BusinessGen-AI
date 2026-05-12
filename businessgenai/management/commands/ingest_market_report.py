from django.core.management.base import BaseCommand, CommandError

from businessgenai.rag import RagUnavailableError, ingest_market_report


class Command(BaseCommand):
    help = "Index a PDF/TXT market report into the ChromaDB RAG vector store."

    def add_arguments(self, parser):
        parser.add_argument("file_path")
        parser.add_argument("--source-name", default=None)

    def handle(self, *args, **options):
        try:
            result = ingest_market_report(options["file_path"], options["source_name"])
        except (FileNotFoundError, ValueError, RagUnavailableError) as exc:
            raise CommandError(str(exc)) from exc

        self.stdout.write(self.style.SUCCESS(
            f"Indexed {result['chunks_indexed']} chunks from {result['source']}"
        ))
