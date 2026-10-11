#!/data/data/com.termux/files/usr/bin/bash
# Polls the termux-tasks branch; runs task.sh when it changes; pushes output to out.txt.
# Needs: GH_TOKEN env var (GitHub token with repo access).
R="$HOME/rc-tasks"
URL="https://x-access-token:${GH_TOKEN}@github.com/raqialamgirabdullah-rgb/rahcare-pwa.git"
[ -d "$R/.git" ] || git clone -q -b termux-tasks "$URL" "$R"
cd "$R" || exit 1
git config user.name "termux"; git config user.email "termux@localhost"
termux-wake-lock 2>/dev/null
echo "runner started; waiting for tasks (Ctrl+C to stop)"
while true; do
  git pull -q --ff-only 2>/dev/null
  H=$(git log -1 --format=%H -- task.sh 2>/dev/null)
  if [ -n "$H" ] && [ "$H" != "$(cat "$HOME/.rc_last" 2>/dev/null)" ]; then
    echo "$H" > "$HOME/.rc_last"
    echo "running task $H"
    timeout 600 bash task.sh > out.txt 2>&1
    echo "exit: $?" >> out.txt
    git add out.txt && git commit -qm "result $H" && git push -q
  fi
  sleep 15
done
