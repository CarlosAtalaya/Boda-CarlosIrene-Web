from PIL import Image

def analizar_dimensiones(ruta_imagen):
    try:
        with Image.open(ruta_imagen) as img:
            ancho, alto = img.size
            
            # Calcular la proporción (Aspect Ratio)
            proporcion = ancho / alto
            
            print(f"--- Análisis de Imagen ---")
            print(f"Dimensiones: {ancho}px x {alto}px")
            print(f"Proporción decimal (Ancho/Alto): {proporcion:.4f}")
            
            # Determinar orientación
            if ancho > alto:
                print("Orientación: Horizontal (Landscape)")
            elif alto > ancho:
                print("Orientación: Vertical (Portrait)")
            else:
                print("Orientación: Cuadrada")
                
            # Simplificación a una fracción común aproximada
            from fractions import Fraction
            frac = Fraction(ancho, alto).limit_denominator(20)
            print(f"Relación de aspecto aproximada: {frac.numerator}:{frac.denominator}")

    except Exception as e:
        print(f"Error al procesar la imagen: {e}")

# Cambia 'branding-logo.jpg' por la ruta de tu archivo
analizar_dimensiones('branding-logo.png')