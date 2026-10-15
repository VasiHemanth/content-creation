import json
with open("paper-reels/episodes/opera/storyboard.json") as f:
    sb = json.load(f)
for line in sb["lines"]:
    line["data"] = {"text": line["text"]}
    if line["id"] == "scene-18":
        line["data"]["handle"] = "hemanth_with_ai"
        line["data"]["credit"] = "arXiv 2609.33987"
with open("paper-reels/episodes/opera/storyboard.json", "w") as f:
    json.dump(sb, f, indent=2)
