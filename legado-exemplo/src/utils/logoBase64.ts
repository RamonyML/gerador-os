// Logo da empresa em base64 para uso no PDF

export const getMZLogoBase64 = async (): Promise<string> => {
  try {
    // Tentar carregar a logo importando diretamente
    const logoModule = await import('../assets/mzlogo-padrao.png');
    const logoSrc = logoModule.default;
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Não foi possível obter contexto do canvas'));
            return;
          }
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Falha ao carregar a imagem'));
      };
      
      img.src = logoSrc;
    });
  } catch (error) {
    console.warn('Erro ao importar logo:', error);
    throw error;
  }
};

// Fallback: logo MZ Net em formato texto
export const getMZLogoTextFallback = (): string => {
  return 'MZ NET';
};