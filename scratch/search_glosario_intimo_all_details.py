import os
import fitz # PyMuPDF
from docx import Document

root_dir = '/Users/inigobarrerabarcelo/Library/CloudStorage/GoogleDrive-inigoku@gmail.com/Mi unidad/Horizonte'

print("Searching for 'glosario íntimo' or 'glosario intimo' in all files...")

for dirpath, _, filenames in os.walk(root_dir):
    for f in filenames:
        ext = os.path.splitext(f)[1].lower()
        filepath = os.path.join(dirpath, f)
        
        if f.startswith('~$') or f.startswith('.'):
            continue
            
        text_content = ""
        
        if ext in ['.md', '.txt', '.html']:
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                    text_content = file.read()
            except Exception:
                pass
        elif ext == '.pdf':
            try:
                doc = fitz.open(filepath)
                text_content = "\n".join([page.get_text() for page in doc])
                doc.close()
            except Exception:
                pass
        elif ext == '.docx':
            try:
                doc = Document(filepath)
                text_content = "\n".join([p.text for p in doc.paragraphs])
            except Exception:
                pass
                
        if text_content:
            text_lower = text_content.lower()
            if 'glosario íntimo' in text_lower or 'glosario intimo' in text_lower:
                idx = text_lower.find('glosario íntimo')
                if idx == -1:
                    idx = text_lower.find('glosario intimo')
                
                # Print the content from idx to the next 3000 characters
                start = max(0, idx - 100)
                end = min(len(text_content), idx + 3000)
                print(f"\n========================================\nFOUND IN: {filepath}\n========================================\n")
                print(text_content[start:end])
                print("\n========================================\n")
