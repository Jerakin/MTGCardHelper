from pathlib import Path
from dotenv import load_dotenv
import shutil
import os
import subprocess
import xml.etree.ElementTree as ET

NAME = "MTGCardHelper"
root = Path(__file__).parent
app = root / "app"
build = root / "build" / NAME
dist = root / "dist"

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


def build_app(v):
    build_ = dist / f"{NAME}-{v}.zxp"
    if build_.exists():
        build_.unlink()
    cmd = [os.getenv('ZXPSIGNCMD'), "-sign", build.as_posix(), build_.as_posix(),
           os.getenv('CERTIFICATE'), os.getenv('PASSWORD'),  "-tsa", "http://time.certum.pl/"]

    subprocess.run(cmd)


def verify_app(v):
    cmd = [os.getenv('ZXPSIGNCMD'), "-verify", dist / f"{NAME}-{v}.zxp",
           "-certinfo"]

    subprocess.run(cmd)


def update_version(v):
    source = build / "CSXS" / "manifest.xml"

    tree = ET.parse(source.as_posix())
    xml_root = tree.getroot()
    xml_root.set("ExtensionBundleVersion", v)

    ext_list = xml_root.find("ExtensionList")
    for ext in ext_list.iter("Extension"):
        ext.set("Version", v)
    tree.write(source.as_posix())


app_version = (root / "VERSION").read_text().strip()
setup()
copy_assets()
update_version(app_version)
build_app(app_version)
verify_app(app_version)
