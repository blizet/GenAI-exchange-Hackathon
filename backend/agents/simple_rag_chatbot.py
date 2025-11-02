# agents/simple_rag_chatbot.py

import os
import numpy as np
import pandas as pd
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from typing import Dict, List, Any, Optional
import logging
import json

logger = logging.getLogger(__name__)

# Setup API key
from config import get_settings

settings = get_settings()

EMBEDDING_MODEL_ID = "models/gemini-embedding-001"
MODEL_ID = "gemini-2.0-flash"


class FirestoreRAGChatbot:
    """RAG Chatbot that works with analysis data from Firestore (no PDF documents)"""
    
    def __init__(self):
        self.embeddings_model = GoogleGenerativeAIEmbeddings(
            model=EMBEDDING_MODEL_ID,
            task_type="RETRIEVAL_DOCUMENT"
        )
        self.llm = ChatGoogleGenerativeAI(
            model=MODEL_ID,
            temperature=0.3
        )
    
    def format_analysis_as_documents(self, analysis_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Convert analysis data into document chunks for RAG embeddings"""
        docs = []
        
        if not analysis_data:
            return docs
        
        # Process analysisResults (main structured analysis)
        if 'analysisResults' in analysis_data and analysis_data['analysisResults']:
            results = analysis_data['analysisResults']
            
            for key, value in results.items():
                if isinstance(value, dict):
                    text_parts = []
                    
                    # Extract summary
                    if 'summary' in value:
                        if isinstance(value['summary'], str):
                            text_parts.append(f"Summary: {value['summary']}")
                        elif isinstance(value['summary'], dict):
                            # Handle structured summaries (e.g., claims_analysis)
                            summary_text = self._format_structured_summary(value['summary'])
                            text_parts.append(f"Summary:\n{summary_text}")
                    
                    # Extract full text
                    if 'fullText' in value and value['fullText']:
                        text_parts.append(f"Full Analysis:\n{value['fullText']}")
                    
                    # Extract status and confidence
                    metadata = []
                    if 'status' in value:
                        metadata.append(f"Status: {value['status']}")
                    if 'confidence' in value:
                        metadata.append(f"Confidence: {value['confidence']}")
                    
                    if metadata:
                        text_parts.append("\n".join(metadata))
                    
                    if text_parts:
                        docs.append({
                            'title': f"AI Analysis: {key.replace('_', ' ').title()}",
                            'text': "\n\n".join(text_parts),
                            'type': 'analysis',
                            'doc_id': f'analysis_{key}'
                        })
        
        # Process main analysis object
        if 'analysis' in analysis_data and analysis_data['analysis']:
            main_analysis = analysis_data['analysis']
            text_parts = []
            
            if 'response' in main_analysis and main_analysis['response']:
                text_parts.append(f"Analysis Response:\n{main_analysis['response']}")
            if 'summary' in main_analysis and main_analysis['summary']:
                text_parts.append(f"Summary:\n{main_analysis['summary']}")
            if 'analysisData' in main_analysis and main_analysis['analysisData']:
                text_parts.append(f"Analysis Data:\n{json.dumps(main_analysis['analysisData'], indent=2)}")
            
            if text_parts:
                docs.append({
                    'title': 'Main AI Analysis',
                    'text': "\n\n".join(text_parts),
                    'type': 'analysis',
                    'doc_id': 'main_analysis'
                })
        
        # Process analyses list (multiple analysis runs)
        if 'analyses' in analysis_data and isinstance(analysis_data['analyses'], list):
            for i, analysis in enumerate(analysis_data['analyses']):
                if isinstance(analysis, dict):
                    text_parts = []
                    
                    if 'summary' in analysis and analysis['summary']:
                        text_parts.append(f"Summary:\n{analysis['summary']}")
                    if 'response' in analysis and analysis['response']:
                        text_parts.append(f"Response:\n{analysis['response']}")
                    if 'analysisData' in analysis and analysis['analysisData']:
                        text_parts.append(f"Data:\n{json.dumps(analysis['analysisData'], indent=2)}")
                    
                    if text_parts:
                        analysis_type = analysis.get('type', analysis.get('analysisType', f'Analysis {i+1}'))
                        docs.append({
                            'title': f"AI Analysis: {analysis_type}",
                            'text': "\n\n".join(text_parts),
                            'type': 'analysis',
                            'doc_id': f'analysis_{i}'
                        })
        
        logger.info(f"✅ Formatted {len(docs)} analysis documents for RAG")
        return docs
    
    def _format_structured_summary(self, summary: Dict[str, Any]) -> str:
        """Format structured summary (like claims_analysis) into readable text"""
        lines = []
        
        # Overall score
        if 'overall_credibility_score' in summary:
            lines.append(f"Overall Credibility Score: {summary['overall_credibility_score']}/10")
        
        # Claims analysis
        if 'claims_analysis' in summary and isinstance(summary['claims_analysis'], list):
            lines.append("\nClaims Analysis:")
            for i, claim in enumerate(summary['claims_analysis'], 1):
                lines.append(f"\n  Claim {i}:")
                lines.append(f"    - Statement: {claim.get('claim', 'N/A')}")
                lines.append(f"    - Status: {claim.get('verification_status', 'N/A')}")
                lines.append(f"    - Confidence: {claim.get('confidence_score', 'N/A')}/10")
                lines.append(f"    - Evidence: {claim.get('evidence', 'N/A')}")
                lines.append(f"    - Recommendation: {claim.get('recommendation', 'N/A')}")
        
        # Red flags
        if 'red_flags' in summary and isinstance(summary['red_flags'], list):
            lines.append("\nRed Flags:")
            for flag in summary['red_flags']:
                lines.append(f"  - {flag}")
        
        # Verification needed
        if 'verification_needed' in summary and isinstance(summary['verification_needed'], list):
            lines.append("\nVerification Needed:")
            for item in summary['verification_needed']:
                lines.append(f"  - {item}")
        
        # Summary text
        if 'summary' in summary:
            lines.append(f"\nSummary: {summary['summary']}")
        
        return "\n".join(lines)
    
    def embed_fn(self, title: str, text: str):
        """Generate embeddings for a document"""
        vector = self.embeddings_model.embed_documents([text], titles=[title])[0]
        return vector
    
    async def create_embeddings_df(self, analysis_data: Dict[str, Any]) -> Optional[pd.DataFrame]:
        """Create embeddings dataframe from analysis data only"""
        try:
            # Convert analysis data to document format
            documents = self.format_analysis_as_documents(analysis_data)
            
            if not documents:
                logger.warning("No analysis data to embed")
                return None
            
            df = pd.DataFrame(documents)
            logger.info(f"🔄 Creating embeddings for {len(df)} analysis chunks...")
            
            # Generate embeddings
            df['Embeddings'] = df.apply(
                lambda row: self.embed_fn(row['title'], row['text']), 
                axis=1
            )
            
            logger.info("✅ Embeddings created successfully")
            return df
            
        except Exception as e:
            logger.error(f"❌ Error creating embeddings: {e}")
            return None
    
    def find_top_k_passages(self, query: str, dataframe: pd.DataFrame, top_k: int = 5) -> List[Dict]:
        """Find most relevant analysis chunks using semantic search"""
        query_vec = self.embeddings_model.embed_query(query, task_type="RETRIEVAL_QUERY")
        vectors = np.stack(dataframe['Embeddings'].to_numpy())
        dot_products = np.dot(vectors, query_vec)
        top_k_indices = np.argsort(dot_products)[::-1][:top_k]
        
        results = []
        for idx in top_k_indices:
            results.append({
                'title': dataframe.iloc[idx]['title'],
                'text': dataframe.iloc[idx]['text'],
                'type': dataframe.iloc[idx]['type'],
                'score': float(dot_products[idx]),
                'doc_id': dataframe.iloc[idx].get('doc_id', 'unknown')
            })
        
        return results
    
    def extract_text_from_response(self, response):
        """Extract plain text from LLM response"""
        if response is None:
            return ""
        if hasattr(response, "text") and isinstance(response.text, str):
            return response.text.strip()
        if hasattr(response, "content") and isinstance(response.content, str):
            return response.content.strip()
        return str(response).strip()
    
    async def chat(self, startup_id: str, question: str, analysis_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Main chat function using RAG with analysis data only"""
        try:
            logger.info(f"🤖 Processing chat for startup {startup_id}")
            
            # Validate analysis data
            if not analysis_data:
                return {
                    "success": False,
                    "response": "No analysis data available for this startup. Please wait for analysis to complete.",
                    "context_used": {
                        "has_startup_data": False,
                        "startup_id": startup_id
                    }
                }
            
            # Create embeddings from analysis data
            df = await self.create_embeddings_df(analysis_data)
            
            if df is None or df.empty:
                return {
                    "success": False,
                    "response": "Unable to process analysis data. The analysis might be incomplete or in an unexpected format.",
                    "context_used": {
                        "has_startup_data": True,
                        "startup_id": startup_id,
                        "error": "Empty embeddings dataframe"
                    }
                }
            
            # Find relevant analysis chunks
            passages = self.find_top_k_passages(question, df, top_k=5)
            
            # Build context from relevant passages
            context_pieces = []
            source_titles = []
            for i, p in enumerate(passages, 1):
                excerpt = p['text'][:2000]  # Larger limit for analysis data
                if len(p['text']) > 2000:
                    excerpt += "\n...[truncated]"
                context_pieces.append(f"[{i}] {p['title']}\n{excerpt}")
                source_titles.append(p['title'])
            
            context = "\n\n---\n\n".join(context_pieces)
            
            # Create RAG prompt
            system_instructions = (
                "You are an expert investment analyst assistant with access to AI-generated startup analysis data. "
                "Answer investor questions using ONLY the provided analysis context. "
                "Cite sources using [1], [2], etc. to reference specific analysis sections. "
                "Be concise, data-driven, and professional. "
                "If information is not in the analysis, clearly state that. "
                "Keep responses under 4-5 sentences unless asked for detail."
            )
            
            user_prompt = (
                f"ANALYSIS CONTEXT (numbered sources):\n\n{context}\n\n"
                f"INVESTOR QUESTION: {question}\n\n"
                "ANSWER (concise, cite sources with [1], [2], etc.):"
            )
            
            # Get LLM response
            logger.info("🔄 Generating response from LLM...")
            response = self.llm.invoke(f"SYSTEM: {system_instructions}\n\n{user_prompt}")
            answer_text = self.extract_text_from_response(response)
            
            logger.info(f"✅ Response generated successfully")
            
            return {
                "success": True,
                "response": answer_text.strip(),
                "context_used": {
                    "has_startup_data": True,
                    "startup_id": startup_id,
                    "source_titles": source_titles,
                    "num_sources": len(passages),
                    "total_analysis_chunks": len(df)
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Error in RAG chat: {e}", exc_info=True)
            return {
                "success": False,
                "response": f"I encountered an error processing your question. Please try rephrasing or ask something else.",
                "error": str(e),
                "context_used": {
                    "has_startup_data": bool(analysis_data),
                    "startup_id": startup_id
                }
            }


# Global instance
chatbot = FirestoreRAGChatbot()