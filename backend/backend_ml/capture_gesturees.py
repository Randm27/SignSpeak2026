import cv2, os

gesture_name = "my" 

# 2. Setup absolute paths
script_dir = os.path.dirname(os.path.abspath(__file__))
dataset_path = os.path.join(script_dir, "dataset")
gesture_path = os.path.join(dataset_path, gesture_name)

# 3. Create folders if they don't exist
if not os.path.exists(gesture_path):
    os.makedirs(gesture_path)
    print(f"Created folder: {gesture_path}")

cap = cv2.VideoCapture(0)
count = 0

print("Press SPACE to capture, Q to quit")
while True:
    ret, frame = cap.read()
    cv2.imshow("Capture", frame)
    key = cv2.waitKey(1)
    if key == 32:  # SPACE bar
        img_name = f"{count}.jpg"
        img_full_path = os.path.join(gesture_path, img_name)
        
        # Save the image
        success = cv2.imwrite(img_full_path, frame)
        
        if success:
            print(f"Successfully saved: {img_full_path}")
            count += 1
        else:
            print("Error: Could not write image. Check folder permissions.")

    elif key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()