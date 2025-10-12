#!/bin/bash

# Preview Newsletter Generator
# Generates a preview of the weekly newsletter without sending emails

# Get the service role key from .env file
SUPABASE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env | cut -d '"' -f 2)

if [ -z "$SUPABASE_KEY" ]; then
  echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env file"
  exit 1
fi

# Default neighborhood ID (Piedmont Ave)
NEIGHBORHOOD_ID="${1:-c0e4e442-74c1-4b34-8388-b19f7b1c6a5d}"

# Generate timestamp for unique filename
TIMESTAMP=$(date +%s)
OUTPUT_FILE="newsletter-preview-final-${TIMESTAMP}.html"

echo "🚀 Generating newsletter preview..."
echo "🏘️  Neighborhood ID: ${NEIGHBORHOOD_ID}"
echo "📄 Output file: ${OUTPUT_FILE}"
echo ""

# Call the function
curl -X POST \
  "https://nnwzfliblfuldwxpuata.supabase.co/functions/v1/send-weekly-summary-final" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"neighborhoodId\": \"${NEIGHBORHOOD_ID}\", \"previewOnly\": true}" \
  --output "${OUTPUT_FILE}" \
  --silent \
  --show-error

# Check if successful
if [ $? -eq 0 ] && [ -f "${OUTPUT_FILE}" ]; then
  FILE_SIZE=$(ls -lh "${OUTPUT_FILE}" | awk '{print $5}')
  echo "✅ Success! Preview generated (${FILE_SIZE})"
  echo ""
  echo "📂 File path:"
  echo "   file://$(pwd)/${OUTPUT_FILE}"
  echo ""
  echo "💡 Open the file in your browser to view the newsletter."
else
  echo "❌ Failed to generate preview"
  exit 1
fi

