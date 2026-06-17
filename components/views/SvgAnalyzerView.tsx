import React, { useState, useEffect, useRef, useMemo } from 'react';
import Card from '../ui/Card';

interface SvgAnalysis {
  width: number;
  height: number;
  totalLength: number;
  ledCount: number;
  calculationMethod: 'dynamic' | 'fallback';
}

// Fallback conversion factor for SVGs without physical units (based on 96 DPI)
const PX_TO_MM_FALLBACK = 25.4 / 96;

/**
 * Parses a dimension string (e.g., "302.47mm") into its value and unit.
 * @param dimStr The dimension string from the SVG attribute.
 * @returns An object with the numeric value and the unit string.
 */
const parseDimension = (dimStr: string | null): { value: number; unit: string } => {
  if (!dimStr) return { value: 0, unit: 'px' };
  const match = dimStr.trim().match(/^(-?\d*\.?\d+)\s*([a-zA-Z%]*)$/);
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: match[2].toLowerCase() || 'px',
    };
  }
  return { value: 0, unit: 'px' };
};

/**
 * Converts a value from a given SVG unit to millimeters.
 * @param value The numeric value.
 * @param unit The unit ('mm', 'cm', 'in', 'pt', 'pc', or 'px').
 * @returns The value converted to millimeters.
 */
const convertToMm = (value: number, unit: string): number => {
  switch (unit) {
    case 'mm':
      return value;
    case 'cm':
      return value * 10;
    case 'in':
      return value * 25.4;
    case 'pt': // 1pt = 1/72 inch
      return value * (25.4 / 72);
    case 'pc': // 1pc = 12pt
      return value * 12 * (25.4 / 72);
    case 'px': // Fallback to 96 DPI
    default:
      return value * PX_TO_MM_FALLBACK;
  }
};


const SvgAnalyzerView: React.FC = () => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SvgAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signType, setSignType] = useState<'forex' | 'lumineuse' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!svgContent) {
      setAnalysis(null);
      return;
    }

    const tempDiv = document.createElement('div');
    try {
      setError(null);
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = doc.documentElement;

      if (svgElement.tagName.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) {
        throw new Error("Fichier invalide. Veuillez téléverser un fichier SVG valide.");
      }
      
      // --- New, more accurate calculation logic ---
      const widthAttr = svgElement.getAttribute('width');
      const heightAttr = svgElement.getAttribute('height');
      const viewBoxAttr = svgElement.getAttribute('viewBox');

      let scaleX = PX_TO_MM_FALLBACK;
      let scaleY = PX_TO_MM_FALLBACK;
      let calculationMethod: 'dynamic' | 'fallback' = 'fallback';

      if (widthAttr && heightAttr && viewBoxAttr) {
        const physicalWidth = parseDimension(widthAttr);
        const physicalHeight = parseDimension(heightAttr);
        const viewBoxParts = viewBoxAttr.split(/\s+|,/).map(parseFloat);
        
        if (viewBoxParts.length === 4) {
          const viewBoxWidth = viewBoxParts[2];
          const viewBoxHeight = viewBoxParts[3];

          const physicalWidthInMm = convertToMm(physicalWidth.value, physicalWidth.unit);
          const physicalHeightInMm = convertToMm(physicalHeight.value, physicalHeight.unit);

          if (viewBoxWidth > 0 && viewBoxHeight > 0) {
            scaleX = physicalWidthInMm / viewBoxWidth;
            scaleY = physicalHeightInMm / viewBoxHeight;
            calculationMethod = 'dynamic';
          }
        }
      }
      
      // Render SVG off-screen to use browser's geometry APIs for accurate measurements
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.pointerEvents = 'none';
      tempDiv.appendChild(svgElement.cloneNode(true));
      document.body.appendChild(tempDiv);
      
      const renderedSvg = tempDiv.querySelector('svg');
      if (!renderedSvg) {
        throw new Error("Impossible de rendre le SVG pour l'analyse.");
      }
      
      // 1. Get dimensions of the content using getBBox (in viewBox units)
      const bbox = renderedSvg.getBBox();
      const widthInUnits = bbox.width;
      const heightInUnits = bbox.height;

      // 2. Calculate total length of all geometric paths (in viewBox units)
      const paths = renderedSvg.querySelectorAll('path, line, polyline, polygon, rect, circle, ellipse');
      let totalLengthInUnits = 0;
      paths.forEach((p: SVGGeometryElement) => {
        if (typeof p.getTotalLength === 'function') {
           totalLengthInUnits += p.getTotalLength();
        }
      });

      // 3. Convert all measurements to millimeters using the calculated scale
      const widthInMm = widthInUnits * scaleX;
      const heightInMm = heightInUnits * scaleY;
      // We use the X scale for length, assuming uniform scaling which is common.
      const totalLengthInMm = totalLengthInUnits * scaleX;

      // 4. Simulate LED count based on mm dimensions
      // LED is 6cm (60mm), space is 4cm (40mm). Total module length = 100mm.
      const ledModuleLengthMm = 100; 
      const ledCount = totalLengthInMm > 0 ? Math.floor(totalLengthInMm / ledModuleLengthMm) : 0;

      setAnalysis({
        width: parseFloat(widthInMm.toFixed(3)),
        height: parseFloat(heightInMm.toFixed(3)),
        totalLength: parseFloat(totalLengthInMm.toFixed(3)),
        ledCount,
        calculationMethod,
      });

    } catch (e) {
      setError((e as Error).message);
      setSvgContent(null);
      setAnalysis(null);
    } finally {
        if (tempDiv.parentNode) {
            document.body.removeChild(tempDiv);
        }
    }

  }, [svgContent]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSignType(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSvgContent(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };
  
    const cuttingAnalysis = useMemo(() => {
        if (!analysis) return null;

        const widthInMeters = analysis.width / 1000;
        const heightInMeters = analysis.height / 1000;
        const areaInM2 = widthInMeters * heightInMeters;
        const plateWidthM = 1.2;

        const requiredHeightM = areaInM2 > 0 ? areaInM2 / plateWidthM : 0;
        
        // This is the practical check for whether the design *actually fits*
        const fits = analysis.width <= (plateWidthM * 1000) || analysis.height <= (plateWidthM * 1000);

        return {
            requiredHeight: requiredHeightM,
            fits: fits,
        };
    }, [analysis]);

    const materialNeeds = useMemo(() => {
        if (!analysis || !signType) return null;

        const widthInMeters = analysis.width / 1000;
        const heightInMeters = analysis.height / 1000;
        const areaInM2 = widthInMeters * heightInMeters;
        const plateArea = 2.88; // 1.2m * 2.4m

        const forexSheets = Math.ceil(areaInM2 / plateArea);

        if (signType === 'forex') {
            return {
                forexSheets: forexSheets,
            };
        }

        if (signType === 'lumineuse') {
            const pmmaSheets = forexSheets;
            const edgeLengthM = analysis.totalLength / 1000;
            const leds = analysis.ledCount;
            const totalWattage = leds * 1.2;
            const transformers = Math.ceil(totalWattage / 300);
            return {
                forexSheets: forexSheets,
                pmmaSheets: pmmaSheets,
                edgeLength: edgeLengthM,
                leds: leds,
                transformers: transformers,
            };
        }

        return null;
    }, [analysis, signType]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const renderCalculationNote = () => {
      if (!analysis) {
        return "En attente d'un fichier SVG...";
      }
      if (analysis.calculationMethod === 'dynamic') {
        return "Calculs basés sur les dimensions et le viewBox du fichier SVG pour une précision maximale.";
      }
      return `Calculs basés sur une conversion standard (96 DPI), car les unités physiques n'ont pas pu être déterminées depuis le fichier.`;
  }

  return (
    <div>
      <h2 className="text-3xl font-semibold text-gray-700 mb-6">Analyseur de Fichier SVG</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erreur : </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Visualisation SVG">
            <div className="w-full h-96 bg-gray-200/50 rounded-lg border-2 border-dashed border-gray-300 flex justify-center items-center p-4">
              {svgContent ? (
                <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: svgContent }}
                  style={{'--svg-max-width': '100%', '--svg-max-height': '100%'} as React.CSSProperties}
                />
              ) : (
                <div className="text-center text-gray-500">
                  <UploadIcon />
                  <p className="mt-2">Veuillez téléverser un fichier SVG pour commencer l'analyse.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Actions et Analyse</h4>
             <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/svg+xml"
            />
            <button
              onClick={handleUploadClick}
              className="w-full px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-50 transition-colors mb-6"
            >
              Téléverser un fichier SVG
            </button>
            {analysis && (
              <div className="space-y-3 text-sm animate-fade-in">
                  <h5 className="text-md font-semibold text-gray-600 border-b pb-2 mb-2">Résultats de l'analyse</h5>
                  <InfoRow label="Largeur réelle" value={analysis ? `${analysis.width} mm` : 'N/A'} />
                  <InfoRow label="Hauteur réelle" value={analysis ? `${analysis.height} mm` : 'N/A'} />
                  <InfoRow label="Superficie" value={analysis ? `${((analysis.width / 1000) * (analysis.height / 1000)).toFixed(3)} m²` : 'N/A'} />
                  <InfoRow label="Longueur du tracé" value={analysis ? `${(analysis.totalLength / 1000).toFixed(3)} m` : 'N/A'} />
                  <p className="text-xs text-gray-500 pt-2 italic">
                      * {renderCalculationNote()}
                  </p>
              </div>
            )}
            {analysis && cuttingAnalysis && (
                <div className="mt-6 pt-4 border-t animate-fade-in">
                    <h5 className="text-md font-semibold text-gray-600 mb-3">Analyse de Découpe (Plaque de 1.2m largeur)</h5>
                    
                    <InfoRow label="Hauteur de Plaque Requise" value={`${cuttingAnalysis.requiredHeight.toFixed(3)} m`} />

                    {!cuttingAnalysis.fits && (
                        <div className="mt-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3" role="alert">
                            <p className="font-bold text-sm">Attention : Le fichier est plus large que 1.2m. La hauteur calculée suppose que le fichier peut être réarrangé ou divisé.</p>
                        </div>
                    )}
                     <p className="text-xs text-gray-500 pt-2 italic">
                      * Calcul : Superficie du fichier / 1.2m.
                  </p>
                </div>
            )}
          </Card>
            {analysis && (
            <Card title="Calcul des Besoins en Matériel" className="animate-fade-in">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Sélectionnez le type d'enseigne pour estimer les matériaux nécessaires.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <label className={`flex items-center flex-1 p-3 border rounded-lg cursor-pointer transition-colors ${signType === 'forex' ? 'bg-brand-secondary/20 border-brand-secondary' : 'hover:bg-gray-50'}`}>
                            <input type="radio" name="signType" value="forex" checked={signType === 'forex'} onChange={() => setSignType('forex')} className="h-4 w-4 text-brand-primary focus:ring-brand-secondary border-gray-300"/>
                            <span className="ml-3 text-sm font-medium text-gray-700">Enseigne Forex</span>
                        </label>
                        <label className={`flex items-center flex-1 p-3 border rounded-lg cursor-pointer transition-colors ${signType === 'lumineuse' ? 'bg-brand-secondary/20 border-brand-secondary' : 'hover:bg-gray-50'}`}>
                            <input type="radio" name="signType" value="lumineuse" checked={signType === 'lumineuse'} onChange={() => setSignType('lumineuse')} className="h-4 w-4 text-brand-primary focus:ring-brand-secondary border-gray-300"/>
                            <span className="ml-3 text-sm font-medium text-gray-700">Enseigne Lumineuse</span>
                        </label>
                    </div>

                    {materialNeeds && (
                        <div className="mt-4 pt-4 border-t space-y-2 animate-fade-in text-sm">
                            <h5 className="font-semibold text-gray-700 text-md mb-2">Détails Estimés:</h5>
                            {signType === 'forex' && (
                                <InfoRow label="Plaques de Forex (1.2x2.4m)" value={`${materialNeeds.forexSheets} plaque(s)`} />
                            )}
                            {signType === 'lumineuse' && materialNeeds.forexSheets !== undefined && (
                                <>
                                    <InfoRow label="Plaques de Forex (1.2x2.4m)" value={`${materialNeeds.forexSheets} plaque(s)`} />
                                    <InfoRow label="Plaques de PMMA (1.2x2.4m)" value={`${materialNeeds.pmmaSheets} plaque(s)`} />
                                    <InfoRow label="Longueur du champ" value={`${materialNeeds.edgeLength?.toFixed(3)} m`} />
                                    <InfoRow label="Nombre de LEDs estimé" value={`${materialNeeds.leds} LEDs`} />
                                    <InfoRow label="Transformateurs (300W)" value={`${materialNeeds.transformers} unité(s)`} />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </Card>
            )}
        </div>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{label: string; value: React.ReactNode}> = ({label, value}) => (
    <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
        <span className="font-medium text-gray-600">{label}</span>
        <span className="text-gray-900 font-semibold text-right">{value}</span>
    </div>
);

const UploadIcon = () => (
    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);


export default SvgAnalyzerView;