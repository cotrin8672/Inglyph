package io.github.cotrin8672.inglyph

import kotlin.test.Test
import kotlin.test.assertEquals

class SampleTest {
    @Test
    fun testAddition() {
        assertEquals(4, 2 + 2)
    }

    @Test
    fun testString() {
        val expected = "Hello, World!"
        val actual = "Hello, " + "World!"
        assertEquals(expected, actual)
    }
}