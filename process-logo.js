const fs = require('fs');
const path = require('path');

// Check if sharp is available, if not guide user to install
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Installing sharp package...');
  require('child_process').execSync('npm install sharp', { stdio: 'inherit' });
  sharp = require('sharp');
}

const logoPath = path.join(__dirname, 'newlogo.png');
const publicDir = path.join(__dirname, 'public');

// Define all the sizes we need with zoom factor (1.2 = 20% zoom in)
const sizes = [
  { file: 'favicon-16x16.png', size: 16, zoom: 1.2 },
  { file: 'favicon-32x32.png', size: 32, zoom: 1.2 },
  { file: 'apple-touch-icon.png', size: 180, zoom: 1.2 },
  { file: 'android-chrome-192x192.png', size: 192, zoom: 1.2 },
  { file: 'android-chrome-512x512.png', size: 512, zoom: 1.2 },
  { file: 'mstile-150x150.jpeg', size: 150, zoom: 1.2, format: 'jpeg' }
];

async function processLogo() {
  try {
    console.log('Processing logo...');
    
    // Get original image metadata
    const metadata = await sharp(logoPath).metadata();
    console.log(`Original size: ${metadata.width}x${metadata.height}`);
    
    for (const config of sizes) {
      console.log(`Creating ${config.file} (${config.size}x${config.size})...`);
      
      // Calculate crop dimensions for zoom effect
      const originalSize = Math.min(metadata.width, metadata.height);
      const cropSize = Math.floor(originalSize / config.zoom);
      const left = Math.floor((metadata.width - cropSize) / 2);
      const top = Math.floor((metadata.height - cropSize) / 2);
      
      let pipeline = sharp(logoPath)
        .extract({
          left: Math.max(0, left),
          top: Math.max(0, top),
          width: Math.min(cropSize, metadata.width),
          height: Math.min(cropSize, metadata.height)
        })
        .resize(config.size, config.size, {
          fit: 'cover',
          position: 'center'
        });
      
      // Set format if specified
      if (config.format === 'jpeg') {
        pipeline = pipeline.jpeg({ quality: 90 });
      } else {
        pipeline = pipeline.png({ compressionLevel: 9 });
      }
      
      await pipeline.toFile(path.join(publicDir, config.file));
      console.log(`✓ Created ${config.file}`);
    }
    
    // Also create favicon.ico (using 32x32 as base)
    console.log('Creating favicon.ico...');
    await sharp(logoPath)
      .extract({
        left: Math.max(0, Math.floor((metadata.width - Math.floor(Math.min(metadata.width, metadata.height) / 1.2)) / 2)),
        top: Math.max(0, Math.floor((metadata.height - Math.floor(Math.min(metadata.width, metadata.height) / 1.2)) / 2)),
        width: Math.min(Math.floor(Math.min(metadata.width, metadata.height) / 1.2), metadata.width),
        height: Math.min(Math.floor(Math.min(metadata.width, metadata.height) / 1.2), metadata.height)
      })
      .resize(32, 32, { fit: 'cover', position: 'center' })
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));
    console.log('✓ Created favicon.ico');
    
    console.log('\n✅ All logo files processed successfully!');
    console.log('Zoom factor applied: 1.2x (20% zoom in)');
    
  } catch (error) {
    console.error('Error processing logo:', error);
    process.exit(1);
  }
}

processLogo();
