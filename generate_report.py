#!/usr/bin/env python3
"""
Research Report: Top 3 Free Open-Source Models for Conversational AI
Generates a comprehensive PDF report on TTS, ASR, and Turn-Taking models
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    PageBreak, Image, ListFlowable, ListItem
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
import os

# Font Registration
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))

# Enable bold tags
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')

# Colors
TABLE_HEADER_COLOR = colors.HexColor('#1F4E79')
TABLE_ROW_ODD = colors.HexColor('#F5F5F5')
ACCENT_COLOR = colors.HexColor('#2E7D32')

def create_styles():
    """Create document styles"""
    styles = getSampleStyleSheet()
    
    # Cover title
    styles.add(ParagraphStyle(
        name='CoverTitle',
        fontName='Times New Roman',
        fontSize=36,
        leading=44,
        alignment=TA_CENTER,
        spaceAfter=24,
        textColor=colors.HexColor('#1A237E')
    ))
    
    # Cover subtitle
    styles.add(ParagraphStyle(
        name='CoverSubtitle',
        fontName='Times New Roman',
        fontSize=18,
        leading=24,
        alignment=TA_CENTER,
        spaceAfter=36,
        textColor=colors.HexColor('#455A64')
    ))
    
    # Section heading (H1)
    styles.add(ParagraphStyle(
        name='SectionHeading',
        fontName='Times New Roman',
        fontSize=22,
        leading=28,
        alignment=TA_LEFT,
        spaceBefore=24,
        spaceAfter=12,
        textColor=colors.HexColor('#1565C0'),
        borderColor=colors.HexColor('#1565C0'),
        borderWidth=0,
        borderPadding=0,
    ))
    
    # Subsection heading (H2)
    styles.add(ParagraphStyle(
        name='SubsectionHeading',
        fontName='Times New Roman',
        fontSize=16,
        leading=22,
        alignment=TA_LEFT,
        spaceBefore=18,
        spaceAfter=8,
        textColor=colors.HexColor('#1976D2')
    ))
    
    # Model title (H3)
    styles.add(ParagraphStyle(
        name='ModelTitle',
        fontName='Times New Roman',
        fontSize=14,
        leading=18,
        alignment=TA_LEFT,
        spaceBefore=12,
        spaceAfter=6,
        textColor=ACCENT_COLOR
    ))
    
    # Body text
    styles.add(ParagraphStyle(
        name='CustomBodyText',
        fontName='Times New Roman',
        fontSize=11,
        leading=16,
        alignment=TA_JUSTIFY,
        spaceBefore=4,
        spaceAfter=8,
        firstLineIndent=0
    ))
    
    # Table header
    styles.add(ParagraphStyle(
        name='TableHeader',
        fontName='Times New Roman',
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.white
    ))
    
    # Table cell
    styles.add(ParagraphStyle(
        name='TableCell',
        fontName='Times New Roman',
        fontSize=9,
        leading=12,
        alignment=TA_CENTER
    ))
    
    # Table cell left
    styles.add(ParagraphStyle(
        name='TableCellLeft',
        fontName='Times New Roman',
        fontSize=9,
        leading=12,
        alignment=TA_LEFT
    ))
    
    # Caption
    styles.add(ParagraphStyle(
        name='Caption',
        fontName='Times New Roman',
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        spaceBefore=6,
        spaceAfter=12,
        textColor=colors.HexColor('#666666')
    ))
    
    # Highlight box
    styles.add(ParagraphStyle(
        name='HighlightBox',
        fontName='Times New Roman',
        fontSize=10,
        leading=14,
        alignment=TA_LEFT,
        spaceBefore=4,
        spaceAfter=4,
        leftIndent=10,
        backColor=colors.HexColor('#E3F2FD'),
        borderColor=colors.HexColor('#1976D2'),
        borderWidth=1,
        borderPadding=8
    ))
    
    # URL style
    styles.add(ParagraphStyle(
        name='URLStyle',
        fontName='Times New Roman',
        fontSize=9,
        leading=12,
        alignment=TA_LEFT,
        textColor=colors.HexColor('#1565C0')
    ))
    
    return styles

def create_cover_page(story, styles):
    """Create cover page"""
    story.append(Spacer(1, 120))
    
    story.append(Paragraph(
        "<b>Research Report</b>",
        styles['CoverTitle']
    ))
    
    story.append(Spacer(1, 24))
    
    story.append(Paragraph(
        "Top 3 Free Open-Source Models for<br/>Building Modern Conversational AI",
        styles['CoverSubtitle']
    ))
    
    story.append(Spacer(1, 48))
    
    story.append(Paragraph(
        "<b>Components Covered:</b>",
        ParagraphStyle(
            name='CoverInfo',
            fontName='Times New Roman',
            fontSize=14,
            leading=20,
            alignment=TA_CENTER
        )
    ))
    
    story.append(Spacer(1, 12))
    
    components = [
        "Low-Latency Text-to-Speech (TTS)",
        "Speech-to-Text (ASR) Models",
        "Turn-Taking / Conversation Timing Models"
    ]
    
    for comp in components:
        story.append(Paragraph(
            comp,
            ParagraphStyle(
                name='CoverItem',
                fontName='Times New Roman',
                fontSize=12,
                leading=18,
                alignment=TA_CENTER,
                textColor=colors.HexColor('#455A64')
            )
        ))
    
    story.append(Spacer(1, 72))
    
    story.append(Paragraph(
        "Comprehensive Analysis for Building<br/>Production-Ready Voice AI Systems",
        ParagraphStyle(
            name='CoverDesc',
            fontName='Times New Roman',
            fontSize=12,
            leading=18,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#666666')
        )
    ))
    
    story.append(Spacer(1, 48))
    
    story.append(Paragraph(
        "2025 Research Compilation",
        ParagraphStyle(
            name='CoverDate',
            fontName='Times New Roman',
            fontSize=12,
            leading=16,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#888888')
        )
    ))
    
    story.append(PageBreak())

def create_executive_summary(story, styles):
    """Create executive summary section"""
    story.append(Paragraph("<b>Executive Summary</b>", styles['SectionHeading']))
    
    story.append(Paragraph(
        "This research report identifies the top three free, open-source models in each critical category "
        "required to build a modern, intelligent conversational AI system. The analysis focuses on models "
        "that combine state-of-the-art performance with zero licensing costs, making them ideal for both "
        "research and commercial applications. The selected models represent the cutting edge of voice AI "
        "technology, offering production-ready solutions that can be deployed independently or combined "
        "to create sophisticated conversational agents.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 12))
    
    story.append(Paragraph(
        "The conversational AI landscape has evolved dramatically in recent years, with open-source "
        "solutions now rivaling or exceeding proprietary alternatives in both quality and performance. "
        "This democratization of voice AI technology enables developers, researchers, and organizations "
        "to build sophisticated voice interfaces without the prohibitive costs traditionally associated "
        "with enterprise speech solutions. Each model selected in this report has been evaluated based on "
        "multiple criteria including latency, accuracy, ease of deployment, language support, and "
        "community adoption.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 18))
    
    # Summary table
    story.append(Paragraph("<b>Quick Reference Summary</b>", styles['SubsectionHeading']))
    
    summary_data = [
        [
            Paragraph('<b>Category</b>', styles['TableHeader']),
            Paragraph('<b>Top Pick</b>', styles['TableHeader']),
            Paragraph('<b>Key Advantage</b>', styles['TableHeader']),
            Paragraph('<b>License</b>', styles['TableHeader'])
        ],
        [
            Paragraph('Text-to-Speech (TTS)', styles['TableCellLeft']),
            Paragraph('Chatterbox Turbo', styles['TableCell']),
            Paragraph('~75ms latency, voice cloning', styles['TableCellLeft']),
            Paragraph('MIT', styles['TableCell'])
        ],
        [
            Paragraph('Speech-to-Text (ASR)', styles['TableCellLeft']),
            Paragraph('Canary-Qwen-2.5B', styles['TableCell']),
            Paragraph('5.63% WER, #1 on leaderboard', styles['TableCellLeft']),
            Paragraph('Apache 2.0', styles['TableCell'])
        ],
        [
            Paragraph('Turn-Taking', styles['TableCellLeft']),
            Paragraph('LiveKit Turn Detector', styles['TableCell']),
            Paragraph('Context-aware EOU detection', styles['TableCellLeft']),
            Paragraph('Apache 2.0', styles['TableCell'])
        ],
    ]
    
    summary_table = Table(summary_data, colWidths=[3.5*cm, 4*cm, 5*cm, 2.5*cm])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(Spacer(1, 12))
    story.append(summary_table)
    story.append(Paragraph("Table 1: Quick reference summary of top picks in each category", styles['Caption']))
    
    story.append(PageBreak())

def create_tts_section(story, styles):
    """Create TTS models section"""
    story.append(Paragraph("<b>1. Low-Latency Text-to-Speech (TTS) Models</b>", styles['SectionHeading']))
    
    story.append(Paragraph(
        "Text-to-Speech synthesis has undergone a revolutionary transformation with the advent of large "
        "language model-based approaches. Modern TTS systems can generate natural, expressive speech "
        "with latencies low enough for real-time conversational applications. The following three models "
        "represent the best free, open-source options currently available, each excelling in different "
        "aspects of TTS synthesis.",
        styles['CustomBodyText']
    ))
    
    # Model 1: Chatterbox
    story.append(Paragraph("<b>1.1 Chatterbox Turbo (Resemble AI)</b>", styles['ModelTitle']))
    
    story.append(Paragraph(
        "Chatterbox, developed by Resemble AI, represents a breakthrough in open-source TTS technology. "
        "Released in 2025, it quickly established itself as one of the fastest and most capable open-source "
        "TTS models available. The model is built on a 0.5B parameter LLaMA architecture, optimized for "
        "real-time inference without sacrificing voice quality or expressiveness. What sets Chatterbox "
        "apart is its combination of enterprise-grade performance with true open-source licensing, "
        "making it suitable for both research and commercial deployment.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 8))
    
    # Chatterbox specs table
    chatterbox_data = [
        [
            Paragraph('<b>Specification</b>', styles['TableHeader']),
            Paragraph('<b>Details</b>', styles['TableHeader'])
        ],
        [
            Paragraph('Latency', styles['TableCellLeft']),
            Paragraph('~75ms (Turbo variant), up to 6x faster than real-time', styles['TableCellLeft'])
        ],
        [
            Paragraph('Voice Cloning', styles['TableCellLeft']),
            Paragraph('Zero-shot cloning with ~5 seconds of reference audio', styles['TableCellLeft'])
        ],
        [
            Paragraph('License', styles['TableCellLeft']),
            Paragraph('MIT License (fully open for commercial use)', styles['TableCellLeft'])
        ],
        [
            Paragraph('Model Size', styles['TableCellLeft']),
            Paragraph('0.5B parameters (LLaMA-based architecture)', styles['TableCellLeft'])
        ],
        [
            Paragraph('Key Features', styles['TableCellLeft']),
            Paragraph('Emotional control, voice cloning, multilingual support', styles['TableCellLeft'])
        ],
        [
            Paragraph('GitHub', styles['TableCellLeft']),
            Paragraph('github.com/resemble-ai/chatterbox', styles['URLStyle'])
        ],
    ]
    
    chatterbox_table = Table(chatterbox_data, colWidths=[4*cm, 11*cm])
    chatterbox_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    
    story.append(chatterbox_table)
    story.append(Paragraph("Table 2: Chatterbox Turbo specifications", styles['Caption']))
    
    story.append(Paragraph(
        "Chatterbox has been benchmarked against commercial alternatives like ElevenLabs, demonstrating "
        "comparable quality in blind listening tests. The Turbo variant achieves latency as low as 75ms, "
        "making it suitable for real-time conversational applications where responsiveness is critical. "
        "The model supports zero-shot voice cloning, allowing users to create custom voices with just "
        "a few seconds of reference audio, while maintaining natural prosody and emotional expressiveness.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 12))
    
    # Model 2: Fish Speech
    story.append(Paragraph("<b>1.2 Fish Speech V1.5</b>", styles['ModelTitle']))
    
    story.append(Paragraph(
        "Fish Speech is a multilingual TTS framework that leverages large language models with a novel "
        "Dual-AR (Autoregressive) architecture. Developed as an open-source project, it has quickly "
        "gained recognition for its exceptional performance across multiple languages and its ability "
        "to handle complex linguistic scenarios. The model is trained on approximately 700,000 hours of "
        "audio data spanning multiple languages, resulting in robust cross-lingual synthesis capabilities.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 8))
    
    fish_data = [
        [
            Paragraph('<b>Specification</b>', styles['TableHeader']),
            Paragraph('<b>Details</b>', styles['TableHeader'])
        ],
        [
            Paragraph('Latency', styles['TableCellLeft']),
            Paragraph('Sub-300ms streaming latency, ~1:7 real-time factor on RTX 4090', styles['TableCellLeft'])
        ],
        [
            Paragraph('Languages', styles['TableCellLeft']),
            Paragraph('Multilingual (trained on 700k hours across languages)', styles['TableCellLeft'])
        ],
        [
            Paragraph('VRAM Required', styles['TableCellLeft']),
            Paragraph('As low as 4GB for inference', styles['TableCellLeft'])
        ],
        [
            Paragraph('Architecture', styles['TableCellLeft']),
            Paragraph('Dual-AR with LLM-based approach, replaces traditional G2P', styles['TableCellLeft'])
        ],
        [
            Paragraph('License', styles['TableCellLeft']),
            Paragraph('Open-source (Apache 2.0 style)', styles['TableCellLeft'])
        ],
        [
            Paragraph('GitHub', styles['TableCellLeft']),
            Paragraph('github.com/fishaudio/fish-speech', styles['URLStyle'])
        ],
    ]
    
    fish_table = Table(fish_data, colWidths=[4*cm, 11*cm])
    fish_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    
    story.append(fish_table)
    story.append(Paragraph("Table 3: Fish Speech V1.5 specifications", styles['Caption']))
    
    story.append(Paragraph(
        "Fish Speech excels in handling complex linguistic scenarios where traditional TTS systems often "
        "struggle. By leveraging LLMs for text processing, it eliminates the need for language-specific "
        "grapheme-to-phoneme (G2P) conversion, resulting in more natural pronunciation across diverse "
        "languages and accents. The model's efficient architecture allows it to run on consumer-grade "
        "hardware with as little as 4GB VRAM, making it accessible for developers without access to "
        "enterprise GPU resources.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 12))
    
    # Model 3: CosyVoice
    story.append(Paragraph("<b>1.3 CosyVoice 3 (Alibaba)</b>", styles['ModelTitle']))
    
    story.append(Paragraph(
        "CosyVoice 3, developed by Alibaba's FunAudioLLM team, represents the latest advancement in "
        "streaming speech synthesis. The model introduces innovative bi-streaming capabilities that "
        "support both text-in streaming and audio-out streaming simultaneously. This architecture enables "
        "ultra-low latency synthesis while maintaining high audio quality, making it particularly "
        "well-suited for conversational AI applications where both quality and responsiveness are essential.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 8))
    
    cosy_data = [
        [
            Paragraph('<b>Specification</b>', styles['TableHeader']),
            Paragraph('<b>Details</b>', styles['TableHeader'])
        ],
        [
            Paragraph('Latency', styles['TableCellLeft']),
            Paragraph('Under 100ms streaming latency (as low as 150ms end-to-end)', styles['TableCellLeft'])
        ],
        [
            Paragraph('Streaming', styles['TableCellLeft']),
            Paragraph('Bi-streaming: text-in + audio-out simultaneously', styles['TableCellLeft'])
        ],
        [
            Paragraph('Model Size', styles['TableCellLeft']),
            Paragraph('0.5B parameters (efficient variant available)', styles['TableCellLeft'])
        ],
        [
            Paragraph('Use Cases', styles['TableCellLeft']),
            Paragraph('Live streaming, news broadcasting, chat assistants', styles['TableCellLeft'])
        ],
        [
            Paragraph('License', styles['TableCellLeft']),
            Paragraph('Open-source (Apache 2.0 style)', styles['TableCellLeft'])
        ],
        [
            Paragraph('GitHub', styles['TableCellLeft']),
            Paragraph('github.com/FunAudioLLM/CosyVoice', styles['URLStyle'])
        ],
    ]
    
    cosy_table = Table(cosy_data, colWidths=[4*cm, 11*cm])
    cosy_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    
    story.append(cosy_table)
    story.append(Paragraph("Table 4: CosyVoice 3 specifications", styles['Caption']))
    
    story.append(Paragraph(
        "CosyVoice 3's bi-streaming architecture is a significant innovation in real-time TTS. Unlike "
        "traditional systems that must wait for complete text input before generating audio, CosyVoice 3 "
        "can process incoming text streams while simultaneously outputting audio streams. This capability "
        "dramatically reduces perceived latency in conversational applications, as the AI can begin "
        "speaking almost immediately as text becomes available from the language model.",
        styles['CustomBodyText']
    ))
    
    story.append(PageBreak())

def create_asr_section(story, styles):
    """Create ASR models section"""
    story.append(Paragraph("<b>2. Speech-to-Text (ASR) Models</b>", styles['SectionHeading']))
    
    story.append(Paragraph(
        "Automatic Speech Recognition has reached unprecedented accuracy levels with modern neural "
        "architectures. The open-source ASR landscape now offers models that match or exceed proprietary "
        "services in transcription accuracy while providing the flexibility of local deployment. The "
        "following three models represent the best free options for speech recognition, each optimized "
        "for different use cases from real-time streaming to batch transcription.",
        styles['CustomBodyText']
    ))
    
    # Model 1: Canary-Qwen
    story.append(Paragraph("<b>2.1 Canary-Qwen-2.5B (NVIDIA)</b>", styles['ModelTitle']))
    
    story.append(Paragraph(
        "NVIDIA's Canary-Qwen-2.5B represents a groundbreaking hybrid architecture that combines "
        "automatic speech recognition with large language model capabilities. Currently ranked #1 on "
        "the Hugging Face Open ASR leaderboard with a 5.63% word error rate, it demonstrates how "
        "integrating ASR with LLM understanding can produce superior transcription quality. The model "
        "leverages the Qwen language model to understand context and produce more accurate, coherent "
        "transcriptions even in challenging acoustic conditions.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 8))
    
    canary_data = [
        [
            Paragraph('<b>Specification</b>', styles['TableHeader']),
            Paragraph('<b>Details</b>', styles['TableHeader'])
        ],
        [
            Paragraph('WER (Word Error Rate)', styles['TableCellLeft']),
            Paragraph('5.63% (#1 on Hugging Face Open ASR leaderboard)', styles['TableCellLeft'])
        ],
        [
            Paragraph('Architecture', styles['TableCellLeft']),
            Paragraph('Hybrid ASR-LLM combining speech encoder with Qwen LLM', styles['TableCellLeft'])
        ],
        [
            Paragraph('Training Data', styles['TableCellLeft']),
            Paragraph('1.7M hours of total data samples', styles['TableCellLeft'])
        ],
        [
            Paragraph('Languages', styles['TableCellLeft']),
            Paragraph('English (primary), with multilingual capabilities', styles['TableCellLeft'])
        ],
        [
            Paragraph('License', styles['TableCellLeft']),
            Paragraph('Apache 2.0 (fully open-source)', styles['TableCellLeft'])
        ],
        [
            Paragraph('Framework', styles['TableCellLeft']),
            Paragraph('NVIDIA NeMo ecosystem', styles['TableCellLeft'])
        ],
        [
            Paragraph('Hugging Face', styles['TableCellLeft']),
            Paragraph('huggingface.co/nvidia/canary-qwen-2.5b', styles['URLStyle'])
        ],
    ]
    
    canary_table = Table(canary_data, colWidths=[4*cm, 11*cm])
    canary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    
    story.append(canary_table)
    story.append(Paragraph("Table 5: Canary-Qwen-2.5B specifications", styles['Caption']))
    
    story.append(Paragraph(
        "The hybrid ASR-LLM architecture of Canary-Qwen allows it to leverage language understanding "
        "for more accurate transcription. Traditional ASR systems process audio in isolation, but "
        "Canary-Qwen can use its language model component to resolve ambiguities and produce more "
        "contextually appropriate transcriptions. The model can achieve speeds up to 400x faster than "
        "real-time on optimized hardware, making it suitable for both batch processing and real-time "
        "streaming applications.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 12))
    
    # Model 2: Whisper Large V3 Turbo
    story.append(Paragraph("<b>2.2 Whisper Large V3 Turbo (OpenAI)</b>", styles['ModelTitle']))
    
    story.append(Paragraph(
        "OpenAI's Whisper Large V3 Turbo is an optimized variant of the highly successful Whisper "
        "architecture, designed specifically for high-speed inference while maintaining transcription "
        "quality close to the full Large V3 model. The model has become the de facto standard for "
        "open-source speech recognition, with extensive community support and numerous optimized "
        "implementations available through frameworks like faster-whisper and WhisperKit.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 8))
    
    whisper_data = [
        [
            Paragraph('<b>Specification</b>', styles['TableHeader']),
            Paragraph('<b>Details</b>', styles['TableHeader'])
        ],
        [
            Paragraph('WER', styles['TableCellLeft']),
            Paragraph('~7.7% (comparable to Large V2, slight tradeoff from V3)', styles['TableCellLeft'])
        ],
        [
            Paragraph('Speed', styles['TableCellLeft']),
            Paragraph('216x real-time on Groq, 0.46s latency on optimized hardware', styles['TableCellLeft'])
        ],
        [
            Paragraph('Model Size', styles['TableCellLeft']),
            Paragraph('1.6GB in float16 precision', styles['TableCellLeft'])
        ],
        [
            Paragraph('Languages', styles['TableCellLeft']),
            Paragraph('100+ languages supported', styles['TableCellLeft'])
        ],
        [
            Paragraph('License', styles['TableCellLeft']),
            Paragraph('MIT License', styles['TableCellLeft'])
        ],
        [
            Paragraph('Optimizations', styles['TableCellLeft']),
            Paragraph('faster-whisper, WhisperKit, various quantization options', styles['TableCellLeft'])
        ],
        [
            Paragraph('Hugging Face', styles['TableCellLeft']),
            Paragraph('huggingface.co/openai/whisper-large-v3-turbo', styles['URLStyle'])
        ],
    ]
    
    whisper_table = Table(whisper_data, colWidths=[4*cm, 11*cm])
    whisper_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    
    story.append(whisper_table)
    story.append(Paragraph("Table 6: Whisper Large V3 Turbo specifications", styles['Caption']))
    
    story.append(Paragraph(
        "Whisper's popularity stems from its robust performance across diverse audio conditions and "
        "its extensive language support. The model was trained on 680,000 hours of multilingual data, "
        "giving it exceptional generalization capabilities. The Turbo variant reduces computational "
        "requirements significantly while maintaining accuracy suitable for most production applications. "
        "The extensive ecosystem around Whisper, including faster-whisper for CTRANSLATE2 optimization "
        "and WhisperKit for Apple Silicon, makes it one of the most deployable ASR solutions available.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 12))
    
    # Model 3: Parakeet TDT
    story.append(Paragraph("<b>2.3 Parakeet-TDT-0.6B-v3 (NVIDIA)</b>", styles['ModelTitle']))
    
    story.append(Paragraph(
        "NVIDIA's Parakeet-TDT family is specifically designed for ultra-low-latency streaming "
        "applications. The TDT (Time-Delay Transformer) architecture enables real-time transcription "
        "with minimal latency, making it ideal for conversational AI applications where immediate "
        "feedback is essential. The model balances accuracy with speed, offering configurable latency "
        "profiles from ultra-real-time (300ms) to low-latency (2s) modes.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 8))
    
    parakeet_data = [
        [
            Paragraph('<b>Specification</b>', styles['TableHeader']),
            Paragraph('<b>Details</b>', styles['TableHeader'])
        ],
        [
            Paragraph('Latency Modes', styles['TableCellLeft']),
            Paragraph('ULTRA_REALTIME (0.3s), REALTIME (1s), LOW_LATENCY (2s)', styles['TableCellLeft'])
        ],
        [
            Paragraph('Architecture', styles['TableCellLeft']),
            Paragraph('FastConformer Encoder + TDT Decoder', styles['TableCellLeft'])
        ],
        [
            Paragraph('Model Size', styles['TableCellLeft']),
            Paragraph('0.6B parameters', styles['TableCellLeft'])
        ],
        [
            Paragraph('Training Data', styles['TableCellLeft']),
            Paragraph('1.7M hours (part of NeMo ASR Set 3.0)', styles['TableCellLeft'])
        ],
        [
            Paragraph('Special Feature', styles['TableCellLeft']),
            Paragraph('Built-in End-of-Utterance (EOU) detection for voice agents', styles['TableCellLeft'])
        ],
        [
            Paragraph('License', styles['TableCellLeft']),
            Paragraph('Apache 2.0 (NVIDIA NeMo ecosystem)', styles['TableCellLeft'])
        ],
        [
            Paragraph('PyPI Package', styles['TableCellLeft']),
            Paragraph('parakeet-stream (easy streaming integration)', styles['URLStyle'])
        ],
    ]
    
    parakeet_table = Table(parakeet_data, colWidths=[4*cm, 11*cm])
    parakeet_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    
    story.append(parakeet_table)
    story.append(Paragraph("Table 7: Parakeet-TDT-0.6B-v3 specifications", styles['Caption']))
    
    story.append(Paragraph(
        "Parakeet-TDT stands out for its native streaming capabilities and built-in end-of-utterance "
        "detection. The Parakeet-Realtime-EOU-120M variant is specifically optimized for voice AI "
        "agents, combining ASR with turn detection in a single unified model. This integration "
        "reduces pipeline complexity and improves overall system responsiveness. The model's "
        "configurable latency profiles allow developers to balance between transcription accuracy "
        "and responsiveness based on their specific application requirements.",
        styles['CustomBodyText']
    ))
    
    story.append(PageBreak())

def create_turn_taking_section(story, styles):
    """Create turn-taking models section"""
    story.append(Paragraph("<b>3. Turn-Taking / Conversation Timing Models</b>", styles['SectionHeading']))
    
    story.append(Paragraph(
        "Turn-taking is a critical component of natural conversation that has historically been "
        "challenging for AI systems. The ability to detect when a user has finished speaking, when "
        "to respond, and when to interrupt or yield the floor is essential for creating fluid, "
        "human-like conversational experiences. The following models represent the state-of-the-art "
        "in open-source turn detection and conversation timing.",
        styles['CustomBodyText']
    ))
    
    # Model 1: LiveKit Turn Detector
    story.append(Paragraph("<b>3.1 LiveKit Turn Detector</b>", styles['ModelTitle']))
    
    story.append(Paragraph(
        "LiveKit's Turn Detector is an open-weights transformer model specifically designed for "
        "context-aware end-of-utterance (EOU) detection. Unlike simple silence-based approaches, "
        "the model uses semantic understanding of speech content to predict when a user has finished "
        "speaking, significantly improving the naturalness of voice AI interactions. The model "
        "integrates seamlessly with LiveKit's voice agent framework.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 8))
    
    livekit_data = [
        [
            Paragraph('<b>Specification</b>', styles['TableHeader']),
            Paragraph('<b>Details</b>', styles['TableHeader'])
        ],
        [
            Paragraph('Approach', styles['TableCellLeft']),
            Paragraph('Transformer-based semantic EOU detection', styles['TableCellLeft'])
        ],
        [
            Paragraph('Input', styles['TableCellLeft']),
            Paragraph('Works with VAD or STT endpoint data', styles['TableCellLeft'])
        ],
        [
            Paragraph('Key Advantage', styles['TableCellLeft']),
            Paragraph('Context-aware: understands when speech is complete semantically', styles['TableCellLeft'])
        ],
        [
            Paragraph('Integration', styles['TableCellLeft']),
            Paragraph('Native LiveKit Agents plugin, supports multiple languages', styles['TableCellLeft'])
        ],
        [
            Paragraph('License', styles['TableCellLeft']),
            Paragraph('Apache 2.0', styles['TableCellLeft'])
        ],
        [
            Paragraph('Hugging Face', styles['TableCellLeft']),
            Paragraph('huggingface.co/livekit/turn-detector', styles['URLStyle'])
        ],
    ]
    
    livekit_table = Table(livekit_data, colWidths=[4*cm, 11*cm])
    livekit_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    
    story.append(livekit_table)
    story.append(Paragraph("Table 8: LiveKit Turn Detector specifications", styles['Caption']))
    
    story.append(Paragraph(
        "The LiveKit Turn Detector represents a significant advancement over traditional silence-based "
        "turn detection. By analyzing the semantic content of speech, it can distinguish between "
        "pauses for breath or thought versus actual turn completion. This capability is particularly "
        "valuable in conversational AI, where premature responses can disrupt the natural flow of "
        "dialogue and create a disjointed user experience. The model's integration with the LiveKit "
        "Agents framework provides a complete solution for building real-time voice AI applications.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 12))
    
    # Model 2: TEN VAD + Turn Detection
    story.append(Paragraph("<b>3.2 TEN VAD + Turn Detection</b>", styles['ModelTitle']))
    
    story.append(Paragraph(
        "TEN (The Extensible Network) Framework provides an open-source ecosystem for building "
        "conversational voice AI agents, including both Voice Activity Detection (VAD) and Turn "
        "Detection models. TEN VAD is designed for real-time, low-latency performance on edge devices, "
        "processing audio frames with sub-millisecond latency. The Turn Detection model works in "
        "conjunction with the VAD to provide comprehensive conversation timing capabilities.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 8))
    
    ten_data = [
        [
            Paragraph('<b>Specification</b>', styles['TableHeader']),
            Paragraph('<b>Details</b>', styles['TableHeader'])
        ],
        [
            Paragraph('VAD Latency', styles['TableCellLeft']),
            Paragraph('Sub-millisecond per audio chunk, faster than Silero VAD', styles['TableCellLeft'])
        ],
        [
            Paragraph('Turn Detection', styles['TableCellLeft']),
            Paragraph('Dedicated model for conversation timing', styles['TableCellLeft'])
        ],
        [
            Paragraph('Edge Optimized', styles['TableCellLeft']),
            Paragraph('Designed for on-device, real-time performance', styles['TableCellLeft'])
        ],
        [
            Paragraph('Languages', styles['TableCellLeft']),
            Paragraph('English and Chinese support', styles['TableCellLeft'])
        ],
        [
            Paragraph('License', styles['TableCellLeft']),
            Paragraph('Open-source', styles['TableCellLeft'])
        ],
        [
            Paragraph('GitHub', styles['TableCellLeft']),
            Paragraph('github.com/TEN-framework/ten-vad', styles['URLStyle'])
        ],
    ]
    
    ten_table = Table(ten_data, colWidths=[4*cm, 11*cm])
    ten_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    
    story.append(ten_table)
    story.append(Paragraph("Table 9: TEN VAD specifications", styles['Caption']))
    
    story.append(Paragraph(
        "TEN VAD has demonstrated superior performance compared to established solutions like Silero "
        "VAD in independent benchmarks. While Silero VAD can introduce delays of several hundred "
        "milliseconds in detecting speech transitions, TEN VAD provides near-instantaneous detection, "
        "making it more suitable for responsive conversational applications. The TEN Framework ecosystem "
        "provides a complete solution including VAD, turn detection, and a modular architecture for "
        "building production voice AI agents.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 12))
    
    # Model 3: VAP
    story.append(Paragraph("<b>3.3 Voice Activity Projection (VAP)</b>", styles['ModelTitle']))
    
    story.append(Paragraph(
        "Voice Activity Projection (VAP) is a predictive turn-taking model that forecasts future "
        "voice activity based on acoustic information from all participants in a conversation. "
        "Unlike reactive approaches that only detect current speech activity, VAP predicts upcoming "
        "turn transitions, enabling more natural conversational timing. The model is trained in a "
        "self-supervised manner on spoken dialogue data, learning to anticipate conversational dynamics.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 8))
    
    vap_data = [
        [
            Paragraph('<b>Specification</b>', styles['TableHeader']),
            Paragraph('<b>Details</b>', styles['TableHeader'])
        ],
        [
            Paragraph('Approach', styles['TableCellLeft']),
            Paragraph('Predictive: forecasts future voice activity', styles['TableCellLeft'])
        ],
        [
            Paragraph('Training', styles['TableCellLeft']),
            Paragraph('Self-supervised on spoken dialogue data', styles['TableCellLeft'])
        ],
        [
            Paragraph('Input', styles['TableCellLeft']),
            Paragraph('Voice activity + audio waveform from dialogue', styles['TableCellLeft'])
        ],
        [
            Paragraph('Key Feature', styles['TableCellLeft']),
            Paragraph('Predicts turn transitions before they occur', styles['TableCellLeft'])
        ],
        [
            Paragraph('Languages', styles['TableCellLeft']),
            Paragraph('Multilingual support (research continues)', styles['TableCellLeft'])
        ],
        [
            Paragraph('Implementation', styles['TableCellLeft']),
            Paragraph('Available via Remdis toolkit: github.com/remdis/remdis-en', styles['URLStyle'])
        ],
    ]
    
    vap_table = Table(vap_data, colWidths=[4*cm, 11*cm])
    vap_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    
    story.append(vap_table)
    story.append(Paragraph("Table 10: Voice Activity Projection specifications", styles['Caption']))
    
    story.append(Paragraph(
        "VAP represents a paradigm shift in turn-taking models by moving from reactive to predictive "
        "approaches. The model learns the subtle cues that precede turn transitions, including "
        "prosodic features, pause patterns, and backchannel opportunities. This predictive capability "
        "enables AI systems to prepare responses in advance, reducing perceived latency and creating "
        "more fluid conversational experiences. The Remdis toolkit provides a practical implementation "
        "that integrates VAP with other dialogue system components.",
        styles['CustomBodyText']
    ))
    
    story.append(PageBreak())

def create_comparison_section(story, styles):
    """Create comparison and recommendations section"""
    story.append(Paragraph("<b>4. Comparative Analysis & Recommendations</b>", styles['SectionHeading']))
    
    story.append(Paragraph(
        "This section provides a comparative analysis of the models discussed and offers recommendations "
        "for building a production-ready conversational AI system. The optimal choice depends on specific "
        "requirements including latency constraints, language support needs, deployment environment, "
        "and available computational resources.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("<b>4.1 TTS Model Comparison</b>", styles['SubsectionHeading']))
    
    tts_comparison = [
        [
            Paragraph('<b>Model</b>', styles['TableHeader']),
            Paragraph('<b>Latency</b>', styles['TableHeader']),
            Paragraph('<b>Best For</b>', styles['TableHeader']),
            Paragraph('<b>Trade-offs</b>', styles['TableHeader'])
        ],
        [
            Paragraph('Chatterbox Turbo', styles['TableCell']),
            Paragraph('~75ms', styles['TableCell']),
            Paragraph('Real-time voice agents', styles['TableCellLeft']),
            Paragraph('English-focused', styles['TableCellLeft'])
        ],
        [
            Paragraph('Fish Speech V1.5', styles['TableCell']),
            Paragraph('<300ms', styles['TableCell']),
            Paragraph('Multilingual apps', styles['TableCellLeft']),
            Paragraph('Higher VRAM needs', styles['TableCellLeft'])
        ],
        [
            Paragraph('CosyVoice 3', styles['TableCell']),
            Paragraph('<100ms', styles['TableCell']),
            Paragraph('Streaming dialogue', styles['TableCellLeft']),
            Paragraph('Newer ecosystem', styles['TableCellLeft'])
        ],
    ]
    
    tts_table = Table(tts_comparison, colWidths=[3.5*cm, 2.5*cm, 4.5*cm, 4.5*cm])
    tts_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    
    story.append(tts_table)
    story.append(Paragraph("Table 11: TTS model comparison", styles['Caption']))
    
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("<b>4.2 ASR Model Comparison</b>", styles['SubsectionHeading']))
    
    asr_comparison = [
        [
            Paragraph('<b>Model</b>', styles['TableHeader']),
            Paragraph('<b>WER</b>', styles['TableHeader']),
            Paragraph('<b>Best For</b>', styles['TableHeader']),
            Paragraph('<b>Trade-offs</b>', styles['TableHeader'])
        ],
        [
            Paragraph('Canary-Qwen-2.5B', styles['TableCell']),
            Paragraph('5.63%', styles['TableCell']),
            Paragraph('Highest accuracy needs', styles['TableCellLeft']),
            Paragraph('Larger model size', styles['TableCellLeft'])
        ],
        [
            Paragraph('Whisper V3 Turbo', styles['TableCell']),
            Paragraph('~7.7%', styles['TableCell']),
            Paragraph('Multilingual, easy deploy', styles['TableCellLeft']),
            Paragraph('Slightly lower accuracy', styles['TableCellLeft'])
        ],
        [
            Paragraph('Parakeet-TDT', styles['TableCell']),
            Paragraph('Good', styles['TableCell']),
            Paragraph('Ultra-low latency streaming', styles['TableCellLeft']),
            Paragraph('English-focused', styles['TableCellLeft'])
        ],
    ]
    
    asr_table = Table(asr_comparison, colWidths=[3.5*cm, 2.5*cm, 4.5*cm, 4.5*cm])
    asr_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    
    story.append(asr_table)
    story.append(Paragraph("Table 12: ASR model comparison", styles['Caption']))
    
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("<b>4.3 Turn-Taking Model Comparison</b>", styles['SubsectionHeading']))
    
    turn_comparison = [
        [
            Paragraph('<b>Model</b>', styles['TableHeader']),
            Paragraph('<b>Approach</b>', styles['TableHeader']),
            Paragraph('<b>Best For</b>', styles['TableHeader']),
            Paragraph('<b>Trade-offs</b>', styles['TableHeader'])
        ],
        [
            Paragraph('LiveKit Turn Detector', styles['TableCell']),
            Paragraph('Semantic EOU', styles['TableCell']),
            Paragraph('Context-aware detection', styles['TableCellLeft']),
            Paragraph('Framework dependency', styles['TableCellLeft'])
        ],
        [
            Paragraph('TEN VAD + Turn', styles['TableCell']),
            Paragraph('Fast VAD-based', styles['TableCell']),
            Paragraph('Edge deployment', styles['TableCellLeft']),
            Paragraph('Less semantic context', styles['TableCellLeft'])
        ],
        [
            Paragraph('VAP', styles['TableCell']),
            Paragraph('Predictive', styles['TableCell']),
            Paragraph('Natural timing', styles['TableCellLeft']),
            Paragraph('Research-stage', styles['TableCellLeft'])
        ],
    ]
    
    turn_table = Table(turn_comparison, colWidths=[3.5*cm, 3*cm, 4*cm, 4.5*cm])
    turn_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    
    story.append(turn_table)
    story.append(Paragraph("Table 13: Turn-taking model comparison", styles['Caption']))
    
    story.append(Spacer(1, 18))
    
    story.append(Paragraph("<b>4.4 Recommended Architecture</b>", styles['SubsectionHeading']))
    
    story.append(Paragraph(
        "For building the most modern and capable conversational AI system, the following combination "
        "is recommended based on current state-of-the-art performance and integration capabilities:",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 8))
    
    # Recommended stack
    rec_data = [
        [
            Paragraph('<b>Component</b>', styles['TableHeader']),
            Paragraph('<b>Recommended Model</b>', styles['TableHeader']),
            Paragraph('<b>Rationale</b>', styles['TableHeader'])
        ],
        [
            Paragraph('Text-to-Speech', styles['TableCellLeft']),
            Paragraph('Chatterbox Turbo', styles['TableCell']),
            Paragraph('Lowest latency (~75ms), MIT license, excellent quality', styles['TableCellLeft'])
        ],
        [
            Paragraph('Speech-to-Text', styles['TableCellLeft']),
            Paragraph('Canary-Qwen-2.5B', styles['TableCell']),
            Paragraph('Best accuracy (5.63% WER), hybrid ASR-LLM architecture', styles['TableCellLeft'])
        ],
        [
            Paragraph('Turn-Taking', styles['TableCellLeft']),
            Paragraph('LiveKit Turn Detector', styles['TableCell']),
            Paragraph('Semantic understanding, production-ready integration', styles['TableCellLeft'])
        ],
    ]
    
    rec_table = Table(rec_data, colWidths=[3.5*cm, 4*cm, 7.5*cm])
    rec_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    
    story.append(rec_table)
    story.append(Paragraph("Table 14: Recommended model stack for conversational AI", styles['Caption']))
    
    story.append(Spacer(1, 12))
    
    story.append(Paragraph(
        "This combination offers the best balance of accuracy, latency, and production-readiness. "
        "All three models are fully open-source with permissive licenses (MIT/Apache 2.0), allowing "
        "commercial deployment without licensing fees. The stack can be deployed on consumer-grade "
        "hardware with appropriate GPU resources, with Chatterbox Turbo requiring approximately 4GB "
        "VRAM, Canary-Qwen-2.5B requiring about 6-8GB VRAM, and the LiveKit Turn Detector having "
        "minimal computational requirements.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 12))
    
    story.append(Paragraph(
        "For multilingual applications, consider substituting Fish Speech for Chatterbox and Whisper "
        "Large V3 Turbo for Canary-Qwen, as these models offer broader language support. For edge "
        "deployment scenarios with limited resources, the TEN VAD ecosystem provides an excellent "
        "alternative with its focus on on-device performance and efficiency.",
        styles['CustomBodyText']
    ))

def create_conclusion_section(story, styles):
    """Create conclusion section"""
    story.append(Spacer(1, 24))
    
    story.append(Paragraph("<b>5. Conclusion</b>", styles['SectionHeading']))
    
    story.append(Paragraph(
        "The open-source ecosystem for conversational AI has matured significantly, offering "
        "production-ready solutions that rival proprietary alternatives. This report has identified "
        "the top three free models in each critical category: Chatterbox Turbo, Fish Speech, and "
        "CosyVoice 3 for low-latency text-to-speech; Canary-Qwen-2.5B, Whisper Large V3 Turbo, and "
        "Parakeet-TDT for speech-to-text; and LiveKit Turn Detector, TEN VAD, and Voice Activity "
        "Projection for turn-taking. Each model represents the cutting edge of its respective domain, "
        "and together they provide all the components necessary to build sophisticated, production-ready "
        "conversational AI systems.",
        styles['CustomBodyText']
    ))
    
    story.append(Spacer(1, 12))
    
    story.append(Paragraph(
        "The democratization of these technologies through open-source licensing enables developers, "
        "researchers, and organizations to build voice AI applications without the prohibitive costs "
        "associated with proprietary solutions. As the field continues to advance rapidly, these "
        "models provide a foundation that can be extended and customized for specific use cases while "
        "benefiting from ongoing community development and improvements.",
        styles['CustomBodyText']
    ))

def main():
    """Main function to generate the PDF report"""
    output_path = "/home/z/my-project/download/conversational_ai_models_research.pdf"
    
    # Create document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=2*cm,
        rightMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
        title="Conversational AI Models Research",
        author="Z.ai",
        creator="Z.ai",
        subject="Top 3 Free Open-Source Models for TTS, ASR, and Turn-Taking"
    )
    
    # Create styles
    styles = create_styles()
    
    # Build story
    story = []
    
    # Add sections
    create_cover_page(story, styles)
    create_executive_summary(story, styles)
    create_tts_section(story, styles)
    create_asr_section(story, styles)
    create_turn_taking_section(story, styles)
    create_comparison_section(story, styles)
    create_conclusion_section(story, styles)
    
    # Build PDF
    doc.build(story)
    print(f"PDF generated successfully: {output_path}")
    
    return output_path

if __name__ == "__main__":
    main()
