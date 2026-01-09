#!/bin/bash
set -e

SSL_DIR="/Users/pfjn/Documents/Dev/Web/v0/v0_geolocation/nginx/ssl"
mkdir -p "$SSL_DIR"

if [ ! -f "$SSL_DIR/cert.pem" ] || [ ! -f "$SSL_DIR/key.pem" ]; then
    echo "Generating self-signed SSL certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_DIR/key.pem" \
        -out "$SSL_DIR/cert.pem" \
        -subj "/C=US/ST=State/L=City/O=Development/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:192.168.0.0/16,IP:10.0.0.0/8,IP:172.16.0.0/12"
    echo "SSL certificate generated at $SSL_DIR"
else
    echo "SSL certificate already exists at $SSL_DIR"
fi
