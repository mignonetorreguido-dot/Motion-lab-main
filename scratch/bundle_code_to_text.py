import os
import zipfile

OUTPUT_TXT = "CODIGO_COMPLETO_MOTION_LAB.txt"
OUTPUT_ZIP = "codigo_fuente_motion_lab.zip"

EXCLUDE_DIRS = {'.git', '.next', 'node_modules', 'scratch', '__pycache__'}
EXCLUDE_EXTENSIONS = {'.pdf', '.png', '.jpg', '.jpeg', '.ico', '.svg', '.lock', '.zip', '.tar', '.gz'}
EXCLUDE_FILES = {'package-lock.json', OUTPUT_TXT, OUTPUT_ZIP}

VALID_EXTENSIONS = {
    '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
    '.prisma', '.css', '.json', '.md', '.env.example', '.txt'
}

def should_include(rel_path):
    parts = rel_path.replace('\\', '/').split('/')
    for p in parts:
        if p in EXCLUDE_DIRS:
            return False
            
    filename = os.path.basename(rel_path)
    if filename in EXCLUDE_FILES:
        return False
        
    ext = os.path.splitext(filename)[1].lower()
    if ext in EXCLUDE_EXTENSIONS:
        return False
        
    if filename.startswith('.') and not filename.endswith('.example') and not filename == '.gitignore':
        return False
        
    return ext in VALID_EXTENSIONS or filename in {'.gitignore', '.env.example', 'vercel.json'}

def main():
    root_dir = os.path.abspath(".")
    included_files = []

    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Filtrar directorios a ignorar in-place
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        
        for f in sorted(filenames):
            full_path = os.path.join(dirpath, f)
            rel_path = os.path.relpath(full_path, root_dir)
            if should_include(rel_path):
                included_files.append((rel_path, full_path))

    included_files.sort(key=lambda x: x[0])

    print(f"Total de archivos seleccionados: {len(included_files)}")

    with open(OUTPUT_TXT, "w", encoding="utf-8") as out:
        out.write("================================================================================\n")
        out.write("             MOTION LAB - CÓDIGO FUENTE COMPLETO DEL PROYECTO                   \n")
        out.write("================================================================================\n")
        out.write("Cliente: Prof. Matías (Preparación Física y Rendimiento Deportivo)\n")
        out.write("Desarrollado por: FLEG TECH\n")
        out.write("Integrantes: Luciano Molina, Elías Baltazar, Guido Mignone, Facundo Romero\n")
        out.write("Stack: Next.js 14 (App Router), React 18, Tailwind CSS, PostgreSQL, Prisma ORM\n")
        out.write("URL Oficial: https://motion-lab-preparacion-fisica-y-rendimiento.vercel.app\n")
        out.write("================================================================================\n\n")

        out.write("ÍNDICE DE ARCHIVOS INCLUIDOS:\n")
        out.write("--------------------------------------------------------------------------------\n")
        for i, (rel_path, _) in enumerate(included_files, 1):
            out.write(f"{i:3d}. {rel_path}\n")
        out.write("--------------------------------------------------------------------------------\n\n\n")

        for rel_path, full_path in included_files:
            out.write("=" * 80 + "\n")
            out.write(f"ARCHIVO: {rel_path}\n")
            out.write("=" * 80 + "\n\n")
            try:
                with open(full_path, "r", encoding="utf-8", errors="replace") as f_in:
                    content = f_in.read()
                    out.write(content)
                    if not content.endswith("\n"):
                        out.write("\n")
            except Exception as e:
                out.write(f"[ERROR al leer archivo: {e}]\n")
            out.write("\n\n")

    print(f"Archivo de texto generado con éxito: {OUTPUT_TXT} ({os.path.getsize(OUTPUT_TXT):,} bytes)")

    # También crear un ZIP con la misma estructura limpia para máxima comodidad
    with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for rel_path, full_path in included_files:
            zipf.write(full_path, arcname=rel_path)

    print(f"Archivo ZIP generado con éxito: {OUTPUT_ZIP} ({os.path.getsize(OUTPUT_ZIP):,} bytes)")

if __name__ == "__main__":
    main()
