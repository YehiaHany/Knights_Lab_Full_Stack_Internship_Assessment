import torch
import torchvision.transforms as T
from torchvision.models import resnet50
from torchvision.models.segmentation import deeplabv3_resnet50
from PIL import Image, ImageDraw
import requests
import numpy as np
from ultralytics import YOLO
from PIL import ImageFont

# Try to load a truetype font (system default or fallback)
try:
    font = ImageFont.truetype("arial.ttf", size=36)  # size can be adjusted
except IOError:
    font = ImageFont.load_default()

# Load models
cls_model = resnet50(weights="IMAGENET1K_V1").eval()
seg_model = deeplabv3_resnet50(weights="DEFAULT").eval()
yolo_model = YOLO("yolov5s.pt")

# Class labels
imagenet_labels = requests.get(
    "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt"
).text.splitlines()


def run_all_models(image: Image.Image):
    # ------------------ Classification ------------------
    input_cls = T.Compose([T.Resize((224, 224)), T.ToTensor()])(image).unsqueeze(0)
    with torch.no_grad():
        cls_output = cls_model(input_cls)
        cls_idx = cls_output.argmax(dim=1).item()
        cls_label = imagenet_labels[cls_idx]

    # Image with classification label
    image_cls = image.copy()
    # ------------------ Detection ------------------
    results = yolo_model.predict(image, conf=0.5)[0]
    image_det = image.copy()
    draw_det = ImageDraw.Draw(image_det)
    for box in results.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        cls = int(box.cls[0])
        conf = box.conf[0].item()
        label = f"{yolo_model.model.names[cls]} ({conf:.2f})"
        draw_det.rectangle([x1, y1, x2, y2], outline='lime', width=3)
        draw_det.text((x1, max(y1 - 36, 0)), label, fill='lime', font=font)


    # ------------------ Segmentation ------------------
    input_seg = T.ToTensor()(image).unsqueeze(0)

    with torch.no_grad():
        seg_output = seg_model(input_seg)["out"]
        seg_mask = torch.argmax(seg_output.squeeze(), dim=0).cpu().numpy()

    # Map segmentation class IDs to VOC class names
    segmentation_labels = [
        'background', 'aeroplane', 'bicycle', 'bird', 'boat', 'bottle', 'bus', 'car', 'cat',
        'chair', 'cow', 'diningtable', 'dog', 'horse', 'motorbike', 'person', 'pottedplant',
        'sheep', 'sofa', 'train', 'tvmonitor'
    ]

    # Print unique class IDs in segmentation mask and their names
    unique_ids = np.unique(seg_mask)
    print("\n Segmentation: Detected classes in the image (class ID : class name):")
    for class_id in unique_ids:
        if class_id < len(segmentation_labels):
            print(f"  {class_id:2} : {segmentation_labels[class_id]}")
        else:
            print(f"  {class_id:2} : <unknown>")

    # Keep only animals
    animal_class_ids = [3, 8, 10, 12, 13, 17]  # bird, cat, cow, dog, horse, sheep
    binary_mask = np.isin(seg_mask, animal_class_ids).astype(np.uint8) * 255

    # Convert to PIL image and save
    if np.any(binary_mask):
        segmented_image = Image.fromarray(binary_mask)
        return image_cls, image_det, segmented_image, cls_label
    else:
        print("No pets found in the image.")
        return None, None, None, cls_label