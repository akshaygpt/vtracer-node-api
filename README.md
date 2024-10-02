A Node js API for [Vtracer](https://github.com/visioncortex/vtracer) - Convert raster images to vector.

# Usage guide

- Put the images in `uploads/` dir
- Run the server:
```
node index.js
```
- Call the API with an HTTP POST call
```
curl -X POST "http://localhost:3001/convert" -F "image=@./uploads/<img-file-name>.png" --output output/<desired-output-file-name.svg>
```