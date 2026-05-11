import * as XLSX from 'xlsx';
import PptxGenJS from 'pptxgenjs';

export const exportAsTxt = (messages, filename = 'chat') => {
    const text = messages
        .map((m) => `${m.role.toUpperCase()}:\n${m.content}`)
        .join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
    a.click();
    URL.revokeObjectURL(url);
};

export const exportAsCsv = (messages, filename = 'chat') => {
    const rows = messages.map((m) => [
        m.role,
        m.content.replace(/"/g, '""'),
    ]);
    const csv = [['Role', 'Content'], ...rows]
        .map((r) => `"${r.join('","')}"`)
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

export const exportAsExcel = (messages, filename = 'chat') => {
    const ws = XLSX.utils.aoa_to_sheet([
        ['Role', 'Content'],
        ...messages.map((m) => [m.role, m.content]),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Chat');
    XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportAsPptx = (messages, filename = 'chat') => {
    const pres = new PptxGenJS();
    messages.forEach((msg) => {
        const slide = pres.addSlide();
        slide.addText(msg.role.toUpperCase(), {
            x: 0.5,
            y: 0.5,
            fontSize: 18,
            bold: true,
            color: '363636',
        });
        slide.addText(msg.content, {
            x: 0.5,
            y: 1.2,
            fontSize: 14,
            color: '666666',
            w: '90%',
        });
    });
    pres.writeFile({ fileName: `${filename}.pptx` });
};
