import json

from app.db import fetch_dirty_works


def main() -> None:
    works = fetch_dirty_works()

    print(f"dirty works: {len(works)}")
    print(json.dumps(works[:2], ensure_ascii=False, indent=2, default=str))


if __name__ == "__main__":
    main()
