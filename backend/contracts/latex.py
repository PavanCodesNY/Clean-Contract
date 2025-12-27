import os
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Optional


def _escape_latex(text: str) -> str:
    replacements = {
        "\\": r"\textbackslash{}",
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    return "".join(replacements.get(char, char) for char in text)


def render_latex(
    title: str,
    body: str,
    party_a: Optional[str] = None,
    party_b: Optional[str] = None,
    effective_date: Optional[str] = None,
) -> str:
    safe_title = _escape_latex(title)
    safe_body = "\n\n".join(
        _escape_latex(line) for line in body.splitlines() if line.strip()
    )
    safe_party_a = _escape_latex(party_a) if party_a else "Party A"
    safe_party_b = _escape_latex(party_b) if party_b else "Party B"
    safe_date = _escape_latex(
        effective_date or datetime.utcnow().strftime("%Y-%m-%d")
    )

    return f"""
\\documentclass[11pt]{{article}}
\\usepackage[margin=1in]{{geometry}}
\\usepackage{{parskip}}
\\usepackage{{setspace}}
\\usepackage{{helvet}}
\\renewcommand{{\\familydefault}}{{\\sfdefault}}
\\setstretch{{1.15}}
\\begin{{document}}
\\begin{{center}}
{{\\LARGE \\textbf{{{safe_title}}}}}
\\end{{center}}

\\textbf{{Effective date:}} {safe_date} \\\\
\\textbf{{Party A:}} {safe_party_a} \\\\
\\textbf{{Party B:}} {safe_party_b}

\\vspace{{1em}}
{safe_body}

\\vspace{{2em}}
\\textbf{{Signatures}}

\\vspace{{1em}}
\\noindent\\rule{{0.6\\linewidth}}{{0.4pt}} \\\\
Signature ({safe_party_a}) \\\\
Name: \\\\
Title: \\\\
Date:

\\vspace{{1.5em}}
\\noindent\\rule{{0.6\\linewidth}}{{0.4pt}} \\\\
Signature ({safe_party_b}) \\\\
Name: \\\\
Title: \\\\
Date:
\\end{{document}}
""".strip()


def compile_latex_to_pdf(latex: str, output_path: str) -> str:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    output_dir = Path(output_path).parent
    with tempfile.TemporaryDirectory() as tmp_dir:
        tex_path = Path(tmp_dir) / "contract.tex"
        tex_path.write_text(latex, encoding="utf-8")
        result = subprocess.run(
            ["tectonic", str(tex_path), "--outdir", str(output_dir)],
            check=False,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            raise RuntimeError(result.stderr or "Failed to compile LaTeX.")
    return output_path
