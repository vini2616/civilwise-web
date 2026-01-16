import React, { useMemo } from 'react';

const ShapeVisualizer = ({ segments, deductions, width = 300, height = 200 }) => {
    const pathData = useMemo(() => {
        if (!segments || segments.length === 0) return '';

        let x = 0;
        let y = 0;
        let angle = 0; // Degrees, 0 is right
        let path = `M ${x} ${y}`;

        // Scale factor to fit in view
        // We'll first calculate bounds to determine scale
        let minX = 0, maxX = 0, minY = 0, maxY = 0;
        let tempX = 0, tempY = 0, tempAngle = 0;

        const points = [{ x: 0, y: 0 }];

        segments.forEach((seg, index) => {
            // Default length for visualization if not provided or 0
            // We use a standard unit length if actual length is missing to show shape structure
            const len = 50;

            const rad = tempAngle * (Math.PI / 180);
            tempX += len * Math.cos(rad);
            tempY += len * Math.sin(rad);

            points.push({ x: tempX, y: tempY });

            minX = Math.min(minX, tempX);
            maxX = Math.max(maxX, tempX);
            minY = Math.min(minY, tempY);
            maxY = Math.max(maxY, tempY);

            // Determine bend for next segment
            // Default to 90 degrees if not specified, except for last segment
            if (index < segments.length - 1) {
                // For visualization, we can alternate turns or just go 90 deg down/up
                // Simple logic: 
                // Seg 0 (Right) -> Bend 90 -> Down
                // Seg 1 (Down) -> Bend 90 -> Left
                // This creates a spiral/box effect which is common for stirrups
                // For crank bars, we might need 45 degrees.

                // Let's try to infer from common shapes or just use 90 for now
                // Ideally, the segment definition should have 'angle' relative to previous

                // For now, let's just turn 90 degrees clockwise for every segment
                // This works for U-bends, L-bends, Stirrups
                tempAngle += 90;
            }
        });

        // Calculate Scale and Offset to center in SVG
        const padding = 20;
        const availW = width - 2 * padding;
        const availH = height - 2 * padding;

        const shapeW = maxX - minX;
        const shapeH = maxY - minY;

        const scale = Math.min(
            shapeW > 0 ? availW / shapeW : 1,
            shapeH > 0 ? availH / shapeH : 1
        ) * 0.8; // 0.8 zoom factor

        const offsetX = (width - shapeW * scale) / 2 - minX * scale;
        const offsetY = (height - shapeH * scale) / 2 - minY * scale;

        // Generate Path
        x = points[0].x * scale + offsetX;
        y = points[0].y * scale + offsetY;
        path = `M ${x} ${y}`;

        for (let i = 1; i < points.length; i++) {
            const px = points[i].x * scale + offsetX;
            const py = points[i].y * scale + offsetY;
            path += ` L ${px} ${py}`;
        }

        return path;
    }, [segments, width, height]);

    return (
        <div className="shape-visualizer" style={{
            width: width,
            height: height,
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            {segments && segments.length > 0 ? (
                <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                    <path d={pathData} stroke="#3b82f6" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Start Point Marker */}
                    <circle cx={pathData.split(' ')[1]} cy={pathData.split(' ')[2]} r="4" fill="#ef4444" />
                </svg>
            ) : (
                <span className="text-muted text-sm">No segments defined</span>
            )}
        </div>
    );
};

export default ShapeVisualizer;
