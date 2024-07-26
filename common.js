const tagPattern = /<(badge|bdg) ([^>]*)>/g
const onlySnapshotPattern = /<(badge|bdg) (s|ss|snapshot|S|SS)>/g
const newPattern = /<(badge|bdg) (n|N|(new|NEW)(!)*|)>/g
const oldPattern = /<(badge|bdg) (old|OLD)>/g
const warningPattern = /<(w|W|warning)>([^<]*)<\/\1>/g

function replaceTags(text){
    return text
    .replaceAll(onlySnapshotPattern, '<span class="badge rounded-pill text-bg-warning">Snapshot</span>')
    .replaceAll(newPattern, '<span class="badge rounded-pill text-bg-primary">NEW!</span>')
    .replaceAll(newPattern, '<span class="badge rounded-pill text-bg-danger">OLD</span>')
    .replaceAll(tagPattern, '<span class="badge rounded-pill text-bg-secondary">$2</span>')
    .replaceAll(warningPattern, '<font color=darkred><b>$2</b></font>')
}