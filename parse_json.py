from argparse import ArgumentParser
from tqdm import tqdm
import ujson
import sys
import csv

fieldnames = [
    "tmstmp",
    "typ",
    "stpnm",
    "stpid",
    "vid",
    "dstp",
    "rt",
    "rtdd",
    "rtdir",
    "des",
    "prdtm",
    "tablockid",
    "tatripid",
    "origtatripno",
    "dly",
    "dyn",
    "prdctdn",
    "zone",
    "psgld",
    "stst",
    "stsd",
]


def main(args):
    writer = csv.DictWriter(open("./output.csv", "w"), fieldnames=fieldnames)
    writer.writeheader()
    with open(args.filename, "r") as file:
        for line in tqdm(file):
            obj = ujson.loads(line)
            if len(obj["preds"]) == 0:
                continue
            writer.writerows(obj["preds"])


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("filename")
    main(parser.parse_args(sys.argv[1:]))
