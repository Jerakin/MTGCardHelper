from pathlib import Path
from dotenv import load_dotenv
import shutil
import os
import subprocess


root = Path(__file__).parent
app = root / "app"
build = root / "build" / "MTGCardHelper"
dist = root / "dist" / "MTGCardHelper.zxp"

load_dotenv()

exclude = [".debug", ".env", ".DS_Store", "_MACOSX", "META-INF"]


def setup():
    if build.exists():
        shutil.rmtree(build)

    dist.parent.mkdir(exist_ok=True)
    build.mkdir(parents=True, exist_ok=True)


def copy_assets():
    for file in app.glob("**/*.*"):
        skip = [x for x in exclude if x in file.as_posix()]
        if skip:
            continue
        if file.is_file():
            new_path = build / file.relative_to(app)
            new_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(file, new_path)


def build_app():
    cmd = [os.getenv('ZXPSIGNCMD'), "-sign", build.as_posix(), dist.as_posix(),
           os.getenv('CERTIFICATE'), os.getenv('PASSWORD'),  "-tsa", "http://time.certum.pl/"]

    subprocess.run(cmd)


setup()
copy_assets()
build_app()
