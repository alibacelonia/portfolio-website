#!/usr/bin/env bash
# Publishes the static export to S3 and invalidates CloudFront.
# Usage: S3_BUCKET=... CLOUDFRONT_DISTRIBUTION_ID=... scripts/deploy.sh [out-dir]
set -euo pipefail

OUT_DIR="${1:-out}"
: "${S3_BUCKET:?S3_BUCKET is required}"
: "${CLOUDFRONT_DISTRIBUTION_ID:?CLOUDFRONT_DISTRIBUTION_ID is required}"

if [[ ! -f "$OUT_DIR/index.html" ]]; then
  echo "error: $OUT_DIR/index.html not found; run npm run build first" >&2
  exit 1
fi

IMMUTABLE="public, max-age=31536000, immutable"
REVALIDATE="public, max-age=0, must-revalidate"

echo "1/4 Uploading hashed assets (immutable)"
# Old hashed files are kept so visitors holding older HTML never request missing chunks.
aws s3 sync "$OUT_DIR/_next/static" "s3://$S3_BUCKET/_next/static" \
  --cache-control "$IMMUTABLE" --only-show-errors

echo "2/4 Uploading HTML and other files (revalidated)"
aws s3 sync "$OUT_DIR" "s3://$S3_BUCKET" \
  --exclude "_next/static/*" --exclude "opengraph-image" \
  --cache-control "$REVALIDATE" --delete --only-show-errors

echo "3/4 Uploading the Open Graph image (extensionless, needs an explicit type)"
aws s3 cp "$OUT_DIR/opengraph-image" "s3://$S3_BUCKET/opengraph-image" \
  --content-type "image/png" --cache-control "public, max-age=86400" --only-show-errors

echo "4/4 Invalidating CloudFront"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths "/*" \
  --query "Invalidation.Id" --output text)
aws cloudfront wait invalidation-completed \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --id "$INVALIDATION_ID"

echo "Deployed to s3://$S3_BUCKET (invalidation $INVALIDATION_ID)"
