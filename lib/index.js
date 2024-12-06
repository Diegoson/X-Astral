function get_current_date() {
  const today = new Date();    
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function monospace(input) {
    const boldz = {
        'A': '𝙰', 'B': '𝙱', 'C': '𝙲', 'D': '𝙳', 'E': '𝙴', 'F': '𝙵', 'G': '𝙶',
        'H': '𝙷', 'I': '𝙸', 'J': '𝙹', 'K': '𝙺', 'L': '𝙻', 'M': '𝙼', 'N': '𝙽',
        'O': '𝙾', 'P': '𝙿', 'Q': '𝚀', 'R': '𝚁', 'S': '𝚂', 'T': '𝚃', 'U': '𝚄',
        'V': '𝚅', 'W': '𝚆', 'X': '𝚇', 'Y': '𝚈', 'Z': '𝚉',
        'a': '𝚨', 'b': '𝚩', 'c': '𝚪', 'd': '𝚫', 'e': '𝚬', 'f': '𝚭', 'g': '𝚮',
        'h': '𝚯', 'i': '𝚰', 'j': '𝚱', 'k': '𝚲', 'l': '𝚳', 'm': '𝚴', 'n': '𝚵',
        'o': '𝚶', 'p': '𝚷', 'q': '𝚸', 'r': '𝚹', 's': '𝚺', 't': '𝚻', 'u': '𝚼',
        'v': '𝚽', 'w': '𝚾', 'x': '𝚿', 'y': '𝛀', 'z': '𝛁',
        '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔',
        '7': '𝟕', '8': '𝟖', '9': '𝟗',
        ' ': ' ' 
    };
    return input.split('').map(char => boldz[char] || char).join('');
}

module.exports = { get_current_date, monospace };
