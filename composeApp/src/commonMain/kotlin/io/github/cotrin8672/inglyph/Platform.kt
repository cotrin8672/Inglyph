package io.github.cotrin8672.inglyph

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform